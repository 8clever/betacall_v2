import { Call, config, CustomMqtt, MQTT_TOKEN, ProviderController, Stats, User } from "@betacall/svc-common";
import { HttpException, HttpStatus, Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { createClientAsync, Client, BasicAuthSecurity } from 'soap'
import { Order, Quota } from "./td.types";
import { createHash } from 'crypto'
import { pickupPoints } from './td.pickup.points'

@Injectable()
export class TopDeliveryService implements OnModuleInit {
	private tdClient: Client

	constructor(
		@Inject(MQTT_TOKEN)
		private readonly mqtt: CustomMqtt
	) {

	}

	orders: Map<Order['orderIdentity']['orderId'], Order> = new Map();

	phones: Map<string, Order['orderIdentity']['orderId']> = new Map();

	pickupPoints: Map<string, typeof pickupPoints> = new Map();

	robot: User;

	async onModuleInit() {
		this.robot = await this.mqtt.paranoid("users:robot", {});
		this.tdClient = await createClientAsync(config.topdelivery.url);
		this.tdClient.setSecurity(new BasicAuthSecurity(
			config.topdelivery.basic.user,
			config.topdelivery.basic.password
		));

		for (const p of pickupPoints) {
			const points = this.pickupPoints.get(p.partnerId) || [];
			points.push(p);
			this.pickupPoints.set(p.partnerId, points);
		}
		
		await this.loadOrdersInterval();

		/** refresh orders each 2 hours */
		setInterval(this.loadOrdersInterval, 1000 * 60 * 60 * 2)
	}

	private loadOrdersInterval = async () => {
		try {
			await this.loadOrders();
		} catch (e) {
			Logger.error(e, e.stack);
		}
	}

	getHistoryByOrderId = async (params: { orderId: string }) => {
		const [ response ] = await this.tdClient.getOrderEventsAsync({
			auth: config.topdelivery.body,
			order: {
				orderId: params.orderId
			}
    });
    return response.orderEventsInfo;
}

	getOrdersByIds (ids: (string | number)[]) {
		const orders: Order[] = [];
		for (const id of ids) {
			const order = this.orders.get(Number(id));
			if (order)
				orders.push(order)
		}
		return orders
	}

	private async loadOrders () {
		const [ data ] = await this.tdClient.getCallOrdersAsync({
			auth: config.topdelivery.body
		});

		if (data?.requestResult?.status === 1)
			throw new Error(data.requestResult.message)

		this.orders = new Map();
		this.phones = new Map();
		const orders: Order[] = data.orderInfo;
		const calls: Omit<Call, "id" | "dt" | "user" | "utcOffset">[] = [];

		for (const order of orders) {
			this.orders.set(order.orderIdentity.orderId, order);
			this.phones.set(order.clientInfo.phone, order.orderIdentity.orderId);
			calls.push({
				orderId: order.orderIdentity.orderId.toString(),
				phone: order.clientInfo.phone,
				provider: Call.Provider.TOP_DELIVERY,
				status: Call.Status.NOT_PROCESSED,
				region: order.deliveryAddress.region
			});
		}

		Logger.log(`Top Delivery loaded orders: ${this.orders.size}`)
		if (this.orders.size) {
			for (const [ id, order ] of this.orders) {
				Logger.log(`Order ID: ` + id, order)
				break;
			}
		}

		await this.mqtt.paranoid("call-loop:push", {
			messages: calls,
			provider: Call.Provider.TOP_DELIVERY
		});
	}

	private generateAccessCode (order: Order) {
		const hash = createHash('md5')
		hash.update(`${order.orderIdentity.orderId}+${order.orderIdentity.barcode}`)
		return hash.digest('hex');
	}

	private addStats = async (user: User, payload: Partial<Order>) => {
		const stats: Stats<Partial<Order>> = {
			data: payload,
			provider: Call.Provider.TOP_DELIVERY,
			user
		}
		return this.mqtt.paranoid("stats:add", stats);
	}

	private callConfirm = async (
		user: User, 
		call: Pick<Call, "status"> & Partial<Pick<Call, "dtNextCall">>, 
		order: Order
	) => {
		const payload: Call = {
			...call,
			phone: "",
			orderId: order.orderIdentity.orderId.toString(),
			provider: Call.Provider.TOP_DELIVERY,
			user
		}
		return this.mqtt.paranoid("call:add", payload);
	}

	doneOrderPickup = async (user: User, params: { order: Order, pickupId: number }) => {
		const { order } = params;
		const payload: Partial<Order> = {
			accessCode: this.generateAccessCode(params.order),
			orderIdentity: order.orderIdentity,
			deliveryType: order.deliveryType,
			pickupAddress: {
				id: params.pickupId
			},
			clientInfo: order.clientInfo
		}

		const [ response ] = await this.tdClient.changeOrderDeliveryTypeAsync({
			auth: config.topdelivery.body,
			deliveryTypeParams: payload
		});

		this.handleResponse(response)

		await this.addStats(user, order);
		await this.callConfirm(user, { status: Call.Status.COMPLETED }, order);
	}

	private handleResponse (response: { 
		requestResult: { status: number, message: string }, 
		editOrdersResult?: { message: string }[],
		setOrdersFinalStatus?: { message: string }[]
	}) {
		if (response.requestResult.status === 1) {
			const message = (
				response.setOrdersFinalStatus?.[0]?.message ||
				response.editOrdersResult?.[0]?.message || 
				response.requestResult.message
			);
			throw new HttpException(message, HttpStatus.BAD_REQUEST);
		}
	}

	doneOrder = async (user: User, params: { order: Order }) => {
		const { order } = params;
		const payload: Partial<Order> & { desireDateDelivery: object } = {
			accessCode: this.generateAccessCode(order),
			orderIdentity: order.orderIdentity,
			workStatus: {
				id: 2,
				name: "В работе"
			},
			desireDateDelivery: order.desiredDateDelivery,
			clientInfo: order.clientInfo,
			clientAddress: order.deliveryAddress.inCityAddress
		}

		const [ response ] = await this.tdClient.editOrdersAsync({
			auth: config.topdelivery.body,
			editOrderParams: payload
		});

		this.handleResponse(response);

		await this.addStats(user, { ...order, ...payload });
		await this.callConfirm(user, { status: Call.Status.COMPLETED }, order);
	}

	doneRobot = async (params: { orderId: number, callId: string, robotDeliveryDate: string }) => {
		const intervals = [
      { from: "10:00:00", to: "18:00:00" },
      { from: "10:00:00", to: "22:00:00" }
    ]

    const order = this.orders.get(params.orderId);

    for (const i of intervals) {
      const payload: Order = {
				...order,
				desiredDateDelivery: {
					date: params.robotDeliveryDate,
					timeInterval: {
						bTime: i.from,
						eTime: i.to
					}
				}
			}

      try {
          await this.doneOrder(this.robot, { order: payload });
					await this.mqtt.paranoid("asterisk:release-call", params.callId);
          return true;
      } catch (e) {
				Logger.error(e.message, e.stack);
      }
    }

		return false;
	}

	replaceDateRobot = async (params: { callId: string, orderId: number }) => {
		const day = 1000 * 60 * 60 * 24;
		const replaceDate = new Date(new Date().valueOf() + day).toJSON();
		const order = this.orders.get(params.orderId);
		await this.replaceCallDate(this.robot, { order, replaceDate })
		await this.mqtt.paranoid("asterisk:release-call", params.callId);
		return true;
	}

	readonly denyReasons = Object.freeze({
		1: "Нарушен срок доставки",
		2: "Нет денег в наличии",
		3: "Передумал приобретать",
		4: "Приобрел в другом магазине",
		5: "Не заказывали",
		6: "Не дозвонились/истек срок хранения",
		7: "Другое",
		8: "Размер не соответствует заявленному",
		9: "Товар выглядит иначе, чем на сайте",
		10: "Не устраивает качество",
		11: "Доставлен другой товар"
	})

	denyOrder = async (user: User, params: { order: Order }) => {
		const { order } = params;
		const payload: Partial<Order> = {
			accessCode: this.generateAccessCode(order),
			orderIdentity: order.orderIdentity,
			denyParams: {
				type: "CALL",
				reason: {
					id: order.denyParams.reason.id,
					name: this.denyReasons[order.denyParams.reason.id]
				}
			},
			workStatus: {
				id: 5,
				name: "отказ"
			}
		}

		const [ response ] = await this.tdClient.setOrdersFinalStatusAsync({
			auth: config.topdelivery.body,
			finalStatusParams: payload
		});

		this.handleResponse(response);

		await this.addStats(user, { ...order, ...payload });
		await this.callConfirm(user, { status: Call.Status.COMPLETED }, order);
	}

	underCall = async (user: User, params: { order: Order }) => {
		const { order } = params;
		const payload: Partial<Order> = {
			accessCode: this.generateAccessCode(order),
			orderIdentity: order.orderIdentity,
			event: {
				eventType: {
					id: 20,
					name: "edit_by_cc"
				},
				comment: "Недоступен"
			}
		}
		const [ response ] = await this.tdClient.addOrderEventAsync({
			auth: config.topdelivery.body,
			orderEvent: payload
		});

		this.handleResponse(response);

		await this.addStats(user, { ...order, ...payload });
		await this.callConfirm(user, { status: Call.Status.UNDER_CALL }, order);
	}

	replaceCallDate = async (user: User, params: { order: Order, replaceDate: string }) => {
		const { order } = params;
		const replaceDate = new Date(params.replaceDate);
		const payload: Partial<Order> = {
			accessCode: this.generateAccessCode(order),
			orderIdentity: order.orderIdentity,
			event: {
				eventType: {
					id: 20,
					name: "edit_by_cc"
				},
				comment: `Просит перезвонить позднее %${replaceDate.toLocaleDateString('ru')}%`
			}
		}
		const [ response ] = await this.tdClient.addOrderEventAsync({
			auth: config.topdelivery.body,
			orderEvent: payload
		});
		
		this.handleResponse(response);

		await this.addStats(user, { ...order, ...payload });
		await this.callConfirm(user, { status: Call.Status.REPLACE_DATE, dtNextCall: replaceDate }, order);
	}

	getNearDeliveryDatesIntervals = async (params: { orderId: number }) => {
		const [ response ] = await this.tdClient.getNearDeliveryDatesIntervalsAsync({
				auth: config.topdelivery.body,
				orderIdentity: {
					orderId: params.orderId
				}
		});

		const dateTimeIntervals: Quota[] = response.dateTimeIntervals || [];
		return dateTimeIntervals;
	}
}