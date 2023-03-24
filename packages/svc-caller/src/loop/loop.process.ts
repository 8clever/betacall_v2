import { Queue } from "./loop.queue";
import { Call, config, User } from "@betacall/svc-common";
import { Logger } from "@nestjs/common";
import { CallerService } from "../caller/caller.service";
import { Server } from "net";
import { getUserTopic } from "./user.topic";

export class CallLoop {

  private readonly listeners: Set<string> = new Set();
	
	readonly queue: Queue;
	
  private readonly maxSlots: number;

  private busySlots = 0;

	constructor (
		public readonly name: Call.Provider,
    private callersvc: CallerService,
    private socket: Server
	) {
		this.queue = new Queue(name);
    this.maxSlots = config.providers[this.name].slots;
	}

  init = async () => {
    await this.queue.init();
  }

  private readonly runLoop = () => {
    if (!this.listeners.size) return;
    for (let n = 0; n < this.maxSlots - this.busySlots; n++) {
      process.nextTick(this.next);
    }
  }

  private timeout: NodeJS.Timeout;

  private debouncedRunLoop = () => {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.runLoop, 1000);
  }

  private readonly next = async () => {
    let resolved = false;
    this.busySlots += 1;

    const resolve = () => {
      if (resolved) return;

      this.busySlots -= 1;
      resolved = true;
      this.debouncedRunLoop();
    }

    const timeout = setTimeout(() => {
      Logger.error("Process loop excceed time limit: 3min");
      resolve();
    }, 1000 * 60 * 3)

    try {
      await this.processNextCall();
      clearTimeout(timeout);
    } catch (e) {
      Logger.error(e);
    } finally {
      resolve();
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

  addListener = (id: string) => {
    if (this.listeners.has(id)) return;
    this.listeners.add(id);
    process.nextTick(this.runLoop);
  }

  removeListener = (id: string) => {
    if (!this.listeners.has(id)) return;
    this.listeners.delete(id);
  }

	private readonly processNextCall = async () => {
    const orderId = await this.queue.lPop();
    if (orderId === null) {
      return;
    }

    const dto = await this.callersvc.findLastOrderStatus().where({ orderId }).getOne();
    const canProcess = this.filter(dto);

    if (!canProcess) {
      this.queue.delete(orderId)
      return;
    };

    const round = this.callRound.get(dto.orderId) || 0;
    const gateidx = round % this.callersvc.asterisk.gateaways.length;
    const gateawayName = this.callersvc.asterisk.gateaways[gateidx];

    const call = await this.callersvc.asterisk.call({
      phone: dto.phone,
      gateawayName,
      vars: {
        orderId,
        provider: dto.provider
      }
    });

    this.callRound.set(dto.orderId, round + 1);

    if (call.status === Call.Status.UNDER_CALL) {
      await this.callersvc.add({
        ...dto,
        status: Call.Status.UNDER_CALL,
        callId: call.id
      });
      return this.queue.rPush(orderId);
    }

    if (call.status === Call.Status.OPERATOR) {
      const operator: User = await this.callersvc.mqtt.paranoid('users:find', { login: call.userLogin });
      if (!operator) throw new Error("Process call: user not found");

      await this.callersvc.add({
        ...dto,
        status: Call.Status.OPERATOR,
        callId: call.id,
        user: operator
      });
      this.socket.emit(getUserTopic(operator.login, 'refresh'));
      return this.queue.delete(orderId)
    }

    if (call.status === Call.Status.CONNECTING_PROBLEM)
      return this.queue.lPush(orderId)

    return this.queue.rPush(orderId);
  }
}