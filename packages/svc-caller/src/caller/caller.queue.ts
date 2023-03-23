import { config } from "@betacall/svc-common";
import { createClient } from "redis";

export class Queue {

	private readonly process = new Set<string>();

	constructor (private readonly queueName: string) {}

	private readonly redis = createClient({
    url: config.redisUrl
  });

	init () {
		return this.redis.connect();
	}

	async rPush (id: string) {
		await this.redis.RPUSH(this.queueName, id);
		return this.delete(id);
	}

	async lPush (id: string) {
		await this.redis.LPUSH(this.queueName, id);
		return this.delete(id);
	}

	async lPop (): Promise<string | null> {
		const id = await this.redis.LPOP(this.queueName);
		if (id)
			this.process.add(id);
		return id;
	}

	async list () {
		const list = await this.redis.LRANGE(this.queueName, 0, -1);
		return new Set([
			...list,
			...this.process
		])
	}

	delete (id: string) {
		this.process.delete(id);
	}
}