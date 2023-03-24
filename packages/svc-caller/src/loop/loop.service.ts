import { Call } from "@betacall/svc-common";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Server } from "net";
import { CallerService } from "../caller/caller.service";
import { CallLoop } from "./loop.process"

@Injectable()
export class LoopService implements OnModuleInit {

	providers: Map<Call.Provider, CallLoop> = new Map();

  server: Server

	constructor(
		private callsvc: CallerService
	) {
		
	}

	async onModuleInit() {
    for (const provider of Object.values(Call.Provider)) {
      const loop = new CallLoop(provider, this.callsvc, this.server);
      await loop.init();
			this.providers.set(provider, loop);
		}
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
          user: this.callsvc.robot
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