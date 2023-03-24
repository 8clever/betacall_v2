import { Call, config, CustomMqtt, MQTT_TOKEN, User } from "@betacall/svc-common";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Server } from "net";
import { AsteriskService } from "../asterisk/asterisk.service";
import { CallerService } from "../caller/caller.service";
import { Loop } from "./loop.process"
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
      const parallels = config.providers[provider].slots;
      const loop = new Loop(provider, parallels);
      loop.fn = this.processNextCall;
      await loop.init();
			this.providers.set(provider, loop);
		}
	}

  private filter (call: Call) {
    if (
      call.history ||
      call.status === Call.Status.COMPLETED ||
      call.status === Call.Status.OPERATOR ||
      call.status === Call.Status.REPLACE_DATE && new Date().valueOf() < call.dtNextCall
    ) return false;

    return true;
  }

  private readonly callRound: Map<string, number> = new Map();

  private readonly processNextCall = async (queue: Queue) => {
    const orderId = await queue.lPop();
    if (orderId === null) {
      return;
    }

    const dto = await this.callsvc.findLastOrderStatus().where({ orderId }).getOne();
    const canProcess = this.filter(dto);

    if (!canProcess) {
      queue.delete(orderId)
      return;
    };

    const round = this.callRound.get(dto.orderId) || 0;
    const gateidx = round % this.asterisk.gateaways.length;
    const gateawayName = this.asterisk.gateaways[gateidx];

    const call = await this.asterisk.call({
      phone: dto.phone,
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

    const listCall = await this.callsvc.findLastOrderStatus().where(this.callsvc.queryList(providerName, calls)).getMany();
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
      .where(this.callsvc.queryList(providerName, calls, true))
      .execute();
  }
}