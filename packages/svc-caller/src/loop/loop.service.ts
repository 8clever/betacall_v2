import { Call, config, CustomMqtt, MQTT_TOKEN, User } from "@betacall/svc-common";
import { Inject, Injectable, OnModuleInit, Query } from "@nestjs/common";
import { Server } from "net";
import { In, IsNull, Not } from "typeorm";
import { AsteriskService } from "../asterisk/asterisk.service";
import { CallerService } from "../caller/caller.service";
import { Loop } from "./loop.parallel"
import { Queue } from "./loop.queue";
import { getUserTopic } from "./user.topic";

@Injectable()
export class LoopService implements OnModuleInit {

	providers: Map<Call.Provider, Loop> = new Map();

  socket: Server

  robot: User

	constructor(
    @Inject(MQTT_TOKEN)
    private mqtt: CustomMqtt,
		private callsvc: CallerService,
    private asterisk: AsteriskService
	) {
		
	}

	async onModuleInit() {
    this.robot = await this.mqtt.paranoid('users:robot', "");

    for (const provider of Object.values(Call.Provider)) {
      const parallels = config.providers[provider]?.slots || 0;
      const loop = new Loop(provider, parallels);
      loop.fn = this.processNextCall;
      await loop.init();
			this.providers.set(provider, loop);
		}
	}

  async assignNextOrder (user: User, provider: Call.Provider) {
    const p = this.providers.get(provider);
    if (!p) throw new Error("Provider not found: " + provider);

    const orderId: string = 
      (await p.queue.lPop()) ||
      (await this.mqtt.paranoid(`${provider}:getNextOrder`, {}));
      
    if (!orderId) return false;

    return this.callsvc.assignOrder({
      orderId,
      provider,
      user
    });
  }

  private filter (call: Call) {
    if (
      call.history ||
      call.status === Call.Status.COMPLETED ||
      call.status === Call.Status.OPERATOR ||
      call.status === Call.Status.REPLACE_DATE && new Date().valueOf() < new Date(call.dtNextCall).valueOf()
    ) return false;

    return true;
  }

  private readonly callRound: Map<string, number> = new Map();

  private readonly processNextCall = async (queue: Queue) => {
    const orderId = await queue.lPop();
    if (orderId === null) return;

    const list = await this.callsvc.findLastOrderStatus({ 
      where1: `"orderId"='${orderId}' AND provider='${queue.name}'` 
    });
    const dto = list[0];

    if (!dto) {
      queue.delete(orderId);
      return;
    }

    const canProcess = this.filter(dto);

    if (!canProcess) {
      queue.delete(orderId)
      return;
    };

    const round = this.callRound.get(dto.orderId) || 0;
    const gateidx = round % this.asterisk.gateaways.length;
    const gateawayName = this.asterisk.gateaways[gateidx];

    /** SET TEST PHONE */
    const phone = config.testPhone || dto.phone;

    const call = await this.asterisk.call({
      phone,
      gateawayName,
      vars: {
        orderId,
        provider: dto.provider
      }
    });

    this.callRound.set(dto.orderId, round + 1);

    if (call.status === Call.Status.UNDER_CALL) {
      await this.callsvc.add({
        ...dto,
        status: Call.Status.UNDER_CALL,
        callId: call.id
      });
      return queue.rPush(orderId);
    }

    if (call.status === Call.Status.OPERATOR) {
      const operator: User = await this.mqtt.paranoid('users:find', { login: call.userLogin });
      if (!operator) throw new Error("Process call: user not found");

      await this.callsvc.add({
        ...dto,
        status: Call.Status.OPERATOR,
        callId: call.id,
        user: operator
      });
      this.socket.emit(getUserTopic(operator.login, 'refresh'));
      return queue.delete(orderId)
    }

    if (call.status === Call.Status.CONNECTING_PROBLEM)
      return queue.lPush(orderId)

    return queue.rPush(orderId);
  }

	async push(providerName: Call.Provider, calls: Omit<Call, "id" | "dt" | "user">[]) {
		const provider = this.providers.get(providerName);
		if (!provider)
			throw new Error("Provider by name not found: " + providerName);
		
    if (!calls.length) return;

    const orderIds = calls.map(c => c.orderId);
    const listCall: Call[] = await this.callsvc.findLastOrderStatus({ 
      where1: `"orderId" IN (${orderIds.map(id => `'${id}'`).join(", ")}) AND provider='${providerName}'` 
    })
    const queueList = await provider.queue.list();
    const list = new Map(listCall.map(c => [ c.orderId, c ]));

    for (const c of calls) {
      if (!list.has(c.orderId)) {
        const call = await this.callsvc.add(c);
        list.set(call.orderId, {
          ...call,
          user: this.robot
        });
      }

      const inqueue = queueList.has(c.orderId);
      if (inqueue) continue;

      const call = list.get(c.orderId);
      if (call.status === Call.Status.NOT_PROCESSED)
        await provider.queue.lPush(call.orderId);
      else
        await provider.queue.rPush(call.orderId);
    }

    await this.callsvc.repo.createQueryBuilder()
      .update(Call)
      .set({ history: true })
      .where({
        provider,
        orderId: Not(In(orderIds)),
        history: IsNull()
      })
      .execute();
  }
}