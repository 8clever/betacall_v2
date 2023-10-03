import { CustomMqtt, MQTT_TOKEN, Provider } from "@betacall/svc-common";
import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ProviderService {

	constructor(
		@InjectRepository(Provider)
    public repo: Repository<Provider>,

		@Inject(MQTT_TOKEN)
		private client: CustomMqtt
	) {

	}
}