import { Call, CustomMqtt, MQTT_TOKEN, User, config } from "@betacall/svc-common";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import axios from 'axios';
import { Order } from "./b2cpl_manual.types";
@Injectable()
export class B2CPLManualService {

	constructor (
		@Inject(MQTT_TOKEN)
		private client: CustomMqtt
	) {}

	private baseUrl = "https://callapi.b2cpl.ru";

	private get authHeader () {
		return {
			'b2c-token': config.b2cpl.apiKey
		}
	}

	private orders: Map<string, Order> = new Map();

	getOrdersByIds (ids: string[]) {
		const orders: Order[] = [];
		for (const id of ids) {
			const o = this.orders.get(id);
			if (o) orders.push(o);
		}
		return orders;
	}

	setDeliveryState () {
		
	}

	getNextOrder = async () => {
		const url = `${this.baseUrl}/api/CallFlow/deliverycall`;
		const res = await axios<{ payload: Order[] }>(url, {
			headers: this.authHeader,
			params: {
				qty: 1
			}
		});
		for (const o of res.data.payload) {
			this.orders.set(o.callid, o);
			return o.callid;
		}
		return null;
	}

}