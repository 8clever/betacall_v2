import { Call, CustomMqtt, MQTT_TOKEN, Stats, User, config } from "@betacall/svc-common";
import { BadRequestException, Inject, Injectable, OnModuleInit } from "@nestjs/common";
import axios from 'axios';
import { CallStatusType, DeliveryDayNearest, DeliveryDayNearestParams, DeliverySetState, DenyReason, Order, PackageItem, PvzInfo } from "./b2cpl_manual.types";
@Injectable()
export class B2CPLManualService implements OnModuleInit {

	constructor (
		@Inject(MQTT_TOKEN)
		private client: CustomMqtt
	) {}

	private robot: User;

	async onModuleInit() {
		this.robot = await this.client.paranoid('users:robot', {});
	}

	private baseUrl = "https://callapi.b2cpl.ru";

	private get authHeader () {
		return {
			'b2c-token': config.b2cpl.apiKey
		}
	}

	private orders: Map<string, Order> = new Map();

	async undercall (id: string) {
		const order = this.orders.get(id);
		if (!order) return;

		const dt = new Date().toJSON();
		const payload: DeliverySetState = {
			"callid": order.callid,
			"date_start": dt,
			"date_end": dt,
			"call_statuses":[
				{
					"state":"NOT_ANSWERING",
					"codes": order.packages.map(p => p.code)
				}
			]}
		return this.deliverySetState(this.robot, payload);
	}

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
			throw new BadRequestException(res.data.payload[0].message);
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
		this.orders.delete(params.callid);
	}

	getNextOrder = async (): Promise<Call> => {
		const url = `${this.baseUrl}/api/CallFlow/deliverycall`;
		const res = await axios<{ payload: Order[] }>(url, {
			headers: this.authHeader,
			params: {
				qty: 1
			}
		});
		for (const o of res.data.payload) {
			this.orders.set(o.callid, o);
			const call: Call = {
				orderId: o.callid,
				phone: o.phone,
				provider: Call.Provider.B2CPL_MANUAL,
				status: Call.Status.NOT_PROCESSED,
				user: this.robot
			}
			return call;
		}
		return null;
	}

	async getPvzInfo (code: string) {
		const url = `${this.baseUrl}/api/CallFlow/callpvzinfo`;
		const res = await axios.get<{ payload: PvzInfo[] }>(url, {
			params: {
				code
			},
			headers: this.authHeader
		});
		return res.data.payload;
	}

	async getPackageItems (code: string) {
		const url = `${this.baseUrl}/api/Packages/goods/${code}`;
		const res = await axios.get<{ payload: PackageItem[] }>(url, { headers: this.authHeader });
		return res.data.payload;
	}
}