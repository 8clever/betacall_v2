import { Logger } from "@nestjs/common";
import { ClientMqtt, ClientProviderOptions } from "@nestjs/microservices";
import { config } from "./config";
import { promiseObservable } from "./promiseObservable";

export const MQTT_TOKEN = "MQTT"

export class CustomMqtt extends ClientMqtt {
	async paranoid (topic: string, payload: object | string | number, timeout?: number) {
		for (;;) {
			try {
				const req = this.send(topic, payload);
				const res = await promiseObservable(req, timeout, `Retry request, topic: ${topic}`);
				return res;
			} catch (e) {
				Logger.log(e.message, e.stack);
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