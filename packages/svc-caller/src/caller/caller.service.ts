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

    /** TODO Remove */
    this.push([
      {
        orderId: "1",
        phone: "89585005602",
        provider: Call.Provider.TOP_DELIVERY,
        status: Call.Status.NOT_PROCESSED
      }
    ])
  }

  findLastOrderStatus() {
    return this.callRepo
      .createQueryBuilder("call")
      .distinctOn(['call.orderId'])
      .orderBy('call.orderId, dt desc, id')
  }

  private filter (call: Call) {
    if (
      call.status === Call.Status.DONE ||
      call.status === Call.Status.DONE_PICKUP ||
      call.status === Call.Status.DENY ||
      call.status === Call.Status.REPLACE_DATE && new Date().valueOf() < call.dtNextCall
    ) return false;

    return true;
  }

  private callRound: Map<Call['orderId'], number> = new Map();

  private runMaxQueue = async () => {
    const totalSlots = Object.values(config.gateaways).reduce((memo, g) => memo + g.slots, 0);
    let busySlots = 0;
    for (;;) {
      Logger.log(`Total slots: ${totalSlots}, Busy slots: ${busySlots}`);

      busySlots += 1
      this.processNextCall()
        .catch(this.handleError)
        .then(() => {
          busySlots -= 1;
        });

      while (busySlots >= totalSlots) {
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
      await this.save({
        ...dto,
        id: null,
        status: Call.Status.UNDER_CALL,
        callId: call.id
      });
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
      return;
    }

    if (
      call.status === CALL_STATUS.ASTERISK_BUSY || 
      call.status === CALL_STATUS.CONNECTING_PROBLEM
    ) {
      return this.queueLPush(orderId)
    }

    return this.queueRPush(orderId);
  }

  async push(calls: Omit<Call, "id" | "dt" | "user">[]) {
    if (!calls.length) return;

    const query = `call.orderId in (${calls.map(c => `'${c.orderId}'`).join(",")})`;
    const listCall = await this.findLastOrderStatus().where(query).getMany();
    const queue = await this.queueList();
    const list = new Map(listCall.map(c => [ c.orderId, c ]));

    for (const c of calls) {
      if (!list.has(c.orderId)) {
        const call = await this.save(c);
        list.set(call.orderId, {
          ...call,
          user: this.robot
        });
      }

      const call = list.get(c.orderId);
      const inqueue = queue.has(c.orderId);
      if (inqueue) continue;

      const shouldProcese = this.filter(call);
      if (shouldProcese) {
        await this.redis[call.status === Call.Status.NOT_PROCESSED ? "LPUSH" : "RPUSH"](this.CALL_QUEUE, call.orderId);
      }
    }
  }

  find(where: Partial<Call>) {
    return this.callRepo.find({ where });
  }

  save (data: Partial<Call>) {
    return this.callRepo.save(data);
  }
}