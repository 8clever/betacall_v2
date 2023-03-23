import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm'
import { Call, config, CustomMqtt, MQTT_TOKEN, User } from "@betacall/svc-common"
import { Repository } from 'typeorm'
import { AsteriskService } from "../asterisk/asterisk.service";
import { CALL_STATUS } from "../asterisk/asterisk.constants";
import { Queue } from "./caller.queue";

@Injectable()
export class CallerService implements OnModuleInit {

  constructor(
    @InjectRepository(Call)
    private callRepo: Repository<Call>,
    private asteriskSvc: AsteriskService,
    @Inject(MQTT_TOKEN)
    private mqtt: CustomMqtt
  ) {}

  private readonly queue = new Queue('call-queue');

  private robot: User;

  async onModuleInit() {
    this.robot = await this.mqtt.paranoid('users:robot', {});

    await this.queue.init();

    this.runMaxQueue().catch(this.handleError);

    this.intervalLogs();
  }

  findLastOrderStatus() {
    return this.callRepo
      .createQueryBuilder('call')
      .distinctOn(['call.orderId'])
      .orderBy('call.orderId, dt desc, id')
  }

  private intervalLogs = () => {
    Logger.log(`Slots: ${this.totalSlots}, Busy: ${this.busySlots}`)
    setTimeout(this.intervalLogs, 10000);
  }

  private filter (call: Call) {
    if (
      call.history ||
      call.status === Call.Status.DONE ||
      call.status === Call.Status.DONE_PICKUP ||
      call.status === Call.Status.DENY ||
      call.status === Call.Status.REPLACE_DATE && new Date().valueOf() < call.dtNextCall
    ) return false;

    return true;
  }

  private callRound: Map<Call['orderId'], number> = new Map();

  private readonly totalSlots = Object.values(config.gateaways).reduce((memo, g) => memo + g.slots, 0);

  private busySlots = 0;

  private runMaxQueue = async () => {
    for (;;) {
      this.busySlots += 1
      this.processNextCall()
        .catch(this.handleError)
        .then(() => {
          this.busySlots -= 1;
        });

      while (this.busySlots >= this.totalSlots) {
        await new Promise(res => setTimeout(res, 1000));
      }
    }
  }

  private handleError = (err: Error) => {
    Logger.error(err);
  }

  private processNextCall = async () => {
    const orderId = await this.queue.lPop();
    if (orderId === null) {
      return;
    }

    const dto = await this.findLastOrderStatus().where({ orderId }).getOne();
    const canProcess = this.filter(dto);

    if (!canProcess) {
      this.queue.delete(orderId)
      return;
    };

    const round = this.callRound.get(dto.orderId) || 0;
    const gateidx = round % this.asteriskSvc.gateaways.length;
    const gateawayName = this.asteriskSvc.gateaways[gateidx];

    const call = await this.asteriskSvc.call({
      phone: dto.phone,
      gateawayName,
      vars: {
        orderId,
        provider: dto.provider
      }
    });

    this.callRound.set(dto.orderId, round + 1);

    if (call.status === CALL_STATUS.UNNAVAILABLE) {
      await this.add({
        ...dto,
        status: Call.Status.UNDER_CALL,
        callId: call.id
      });
      return this.queue.rPush(orderId);
    }

    if (call.status === CALL_STATUS.DONE) {
      // TODO Connect OPERATOR with Client
      // const user = await ctx.api.users.getUserByLogin(t, { 
        //     login: call.exten
        // });
        // if (!user) throw new Error("User not found. Exten: " + call.exten);
        
        // ORDERS_IN_OPERATORS[orderId] = 1;
        // serverIo.once(`${user._id}-${orderId}`, () => {
            
        //     // avoid add order to queue twice
        //     setTimeout(() => {
        //         delete ORDERS_IN_OPERATORS[orderId];
        //     }, 10000);
        // });
        // io.emit(user._id, {
        //     orderId,
        //     callId: call.id
        // });
        // return;
      return this.queue.delete(orderId)
    }

    if (call.status === CALL_STATUS.MANUAL_RELEASE) {
      return this.queue.delete(orderId);
    }

    if (
      call.status === CALL_STATUS.ASTERISK_BUSY || 
      call.status === CALL_STATUS.CONNECTING_PROBLEM
    ) {
      return this.queue.lPush(orderId)
    }

    Logger.error("Invalid call status: " + call.status);
  }

  private queryList = (calls: Pick<Call, 'orderId' | 'provider'>[], not: boolean = false) => {
    const provider = calls[0].provider;
    return `call."orderId" ${not ? "not" : ""} in (${calls.map(c => `'${c.orderId}'`).join(",")}) and call.provider = '${provider}' and call.history is null`;
  }

  async push(calls: Omit<Call, "id" | "dt" | "user">[]) {
    if (!calls.length) return;

    const listCall = await this.findLastOrderStatus().where(this.queryList(calls)).getMany();
    const queueList = await this.queue.list();
    const list = new Map(listCall.map(c => [ c.orderId, c ]));

    for (const c of calls) {
      if (!list.has(c.orderId)) {
        const call = await this.add(c);
        list.set(call.orderId, {
          ...call,
          user: this.robot
        });
      }

      const inqueue = queueList.has(c.orderId);
      if (inqueue) continue;

      const call = list.get(c.orderId);
      if (call.status === Call.Status.NOT_PROCESSED)
        await this.queue.lPush(call.orderId);
      else
        await this.queue.rPush(call.orderId);
    }

    await this.callRepo.createQueryBuilder()
      .update(Call)
      .set({ history: true })
      .where(this.queryList(calls, true))
      .execute();
  }

  find(where: Partial<Call>) {
    return this.callRepo.find({ where });
  }

  add (d: Partial<Call>) {
    const data = {...d}
    delete data.id;
    return this.save(data);
  }

  save (data: Partial<Call>) {
    delete data.dt;
    return this.callRepo.save(data);
  }
}