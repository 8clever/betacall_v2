import { Call, CustomMqtt, MQTT_TOKEN, User, config } from "@betacall/svc-common";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import axios from 'axios';
import { Order } from "./b2cpl_manual.types";
@Injectable()
export class B2CPLManualService implements OnModuleInit {

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

	private robot: User;

	getOrdersByIds (ids: string[]) {
		const orders: Order[] = [];
		for (const id of ids) {
			const o = this.orders.get(id);
			if (o) orders.push(o);
		}
		return orders;
	}

	async onModuleInit() {
		this.robot = await this.client.paranoid('users:robot', {});
		await this.loadActualOders();
		setInterval(this.loadActualOders, 1000 * 60 * 15)
	}
	
	loadActualOders = async () => {
		const url = `${this.baseUrl}/api/CallFlow/deliverycall`;
		const res = await axios<{ payload: Order[] }>(url, {
			headers: this.authHeader
		});
		this.orders = new Map(res.data.payload.map(o => [ o.callid, o ]));
		const calls: Call[] = res.data.payload.map(o => {
			return {
				orderId: o.callid,
				phone: o.phone,
				provider: Call.Provider.B2CPL_MANUAL,
				status: Call.Status.NOT_PROCESSED,
				user: this.robot
			}
		});
		await this.client.paranoid('call-loop:push', {
			messages: calls,
			provider: Call.Provider.B2CPL_MANUAL
		});
	}


}