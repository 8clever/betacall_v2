import { Logger } from "@nestjs/common";
import { ClientMqtt, ClientProviderOptions } from "@nestjs/microservices";
import { config } from "./config";
import { promiseObservable } from "./promiseObservable";

export const MQTT_TOKEN = "MQTT"

export class CustomMqtt extends ClientMqtt {
	async paranoid (topic: string, payload: object | string | number| null | undefined) {
		for (;;) {
			try {
				const req = this.send(topic, payload);
				const res = await promiseObservable(req);
				return res;
			} catch {
				Logger.log("Retry request: " + topic);
			}
		}
	}
}

export const mqttRegister: ClientProviderOptions = {
	name: MQTT_TOKEN,
	customClass: CustomMqtt,
	options: {
		url: config.mqttUrl
	}
}