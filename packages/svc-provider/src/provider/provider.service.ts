import { CustomMqtt, MQTT_TOKEN, Provider, Providers } from "@betacall/svc-common";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ProviderService implements OnModuleInit {

	constructor(
		@InjectRepository(Provider)
    public repo: Repository<Provider>,

		@Inject(MQTT_TOKEN)
		private client: CustomMqtt
	) {

	}

	async getProviders () {
		return this.repo.find();
	}

	async onModuleInit() {
		const list = await this.repo.find({});
		const providers = new Map(list.map(i => [ i.key, i ]));
		for (const p of Object.values(Providers)) {
			if (providers.has(p)) 
				continue

			await this.repo.save({
				key: p,
				name: p,
				internal: true,
			});
		}
	}
}