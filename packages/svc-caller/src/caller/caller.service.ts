import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm'
import { Call, config, CustomMqtt, MQTT_TOKEN, User } from "@betacall/svc-common"
import { Repository } from 'typeorm'
import { createClient } from 'redis'
import { AsteriskService } from "../asterisk/asterisk.service";
import { CALL_STATUS } from "../asterisk/asterisk.constants";

@Injectable()
export class CallerService implements OnModuleInit {

  private redis = createClient({
    url: config.redisUrl
  });

  constructor(
    @InjectRepository(Call)
    private callRepo: Repository<Call>,
    private asteriskSvc: AsteriskService,
    @Inject(MQTT_TOKEN)
    private mqtt: CustomMqtt
  ) {}

  private CALL_QUEUE = 'call-queue'

  private robot: User;

  async onModuleInit() {
    this.robot = await this.mqtt.paranoid('users:robot', {});

    await this.redis.connect();

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

  private process: Set<string> = new Set();

  private async queuePop () {
    const id = await this.redis.LPOP(this.CALL_QUEUE);
    if (!id) return null;
    this.process.add(id);
    return id;
  }

  private async queueLPush (id: string) {
    await this.redis.LPUSH(this.CALL_QUEUE, id);
    this.process.delete(id);
  }

  private async queueRPush (id: string) {
    await this.redis.RPUSH(this.CALL_QUEUE, id);
    this.process.delete(id);
  }

  private async queueList () {
    const list = await this.redis.LRANGE(this.CALL_QUEUE, 0, -1);
    return new Set([
      ...list,
      ...this.process
    ])
  }

  private processNextCall = async () => {
    const orderId = await this.queuePop();
    if (orderId === null) {
      return;
    }

    const dto = await this.findLastOrderStatus().where({ orderId }).getOne();
    const canProcess = this.filter(dto);

    if (!canProcess) {
      this.process.delete(orderId);
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
      return this.queueRPush(orderId);
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
      return this.process.delete(orderId)
    }

    if (call.status === CALL_STATUS.MANUAL_RELEASE) {
      return this.process.delete(orderId);
    }

    if (
      call.status === CALL_STATUS.ASTERISK_BUSY || 
      call.status === CALL_STATUS.CONNECTING_PROBLEM
    ) {
      return this.queueLPush(orderId)
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
    const queue = await this.queueList();
    const list = new Map(listCall.map(c => [ c.orderId, c ]));

    for (const c of calls) {
      if (!list.has(c.orderId)) {
        const call = await this.add(c);
        list.set(call.orderId, {
          ...call,
          user: this.robot
        });
      }

      const inqueue = queue.has(c.orderId);
      if (inqueue) continue;

      const call = list.get(c.orderId);
      await this[call.status === Call.Status.NOT_PROCESSED ? "queueLPush" : "queueRPush"](call.orderId);
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