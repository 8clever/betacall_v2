import { CustomMqtt, MQTT_TOKEN } from "@betacall/svc-common";
import { Inject, Injectable } from "@nestjs/common";
import { ObjectLiteral } from "typeorm";

@Injectable()
export class ExportService {

	constructor(
		@Inject(MQTT_TOKEN)
		private client: CustomMqtt
	) {

	}

	async exoprtStats (where: ObjectLiteral) {
		const stats = await this.client.paranoid('stats:list', {
			where
		});

		console.log(stats);
	}
}