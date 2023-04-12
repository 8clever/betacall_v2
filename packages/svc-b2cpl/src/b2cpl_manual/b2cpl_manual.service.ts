import { Call, CustomMqtt, MQTT_TOKEN, Stats, User, config } from "@betacall/svc-common";
import { Inject, Injectable } from "@nestjs/common";
import axios from 'axios';
import { CallStatusType, DeliveryDayNearest, DeliveryDayNearestParams, DeliverySetState, DenyReason, Order } from "./b2cpl_manual.types";
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

	async getCallStatusList () {
		const url = `${this.baseUrl}/api/CallStatus/callstatuslist`;
		const res = await axios.get<{ payload: CallStatusType[] }>(url, {
			headers: this.authHeader
		});
		return res.data.payload;
	}

	async getDenyReasonList () {
		const url = `${this.baseUrl}/api/CallStatus/callrejectreason`
		const res = await axios.get<{ payload: DenyReason[] }>(url, {
			headers: this.authHeader
		});
		return res.data.payload;
	}

	async getDeliveryDayNearest (params: DeliveryDayNearestParams) {
		const url = `${this.baseUrl}/api/CallFlow/deliverydaynearest`;
		const res = await axios.post<{ payload: DeliveryDayNearest[] }>(url, params, {
			headers: this.authHeader
		});
		return res.data.payload;
	}

	async deliverySetState (user: User, params: DeliverySetState) {
		const url = `${this.baseUrl}/api/CallStatus/deliverysetstate`;
		const res = await axios.post<{ status_code: number, payload: { message: string }[] }>(url, params, {
			headers: this.authHeader
		});
		if (res.data.status_code !== 200) {
			throw new Error(res.data.payload[0].message);
		}
		const call: Call = {
			orderId: params.callid,
			phone: '',
			provider: Call.Provider.B2CPL_MANUAL,
			status: Call.Status.COMPLETED,
			user
		}
		const stats: Stats = {
			provider: Call.Provider.B2CPL_MANUAL,
			data: params,
			user
		};
		await this.client.paranoid('call:add', call);
		await this.client.paranoid('stats:add', stats);
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