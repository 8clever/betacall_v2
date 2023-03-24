import { Call, config, CustomMqtt, MQTT_TOKEN, User } from "@betacall/svc-common";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { createClientAsync, Client, BasicAuthSecurity } from 'soap'
import { Order } from "./td.types";
import { createHash } from 'crypto'

@Injectable()
export class TopDeliveryService implements OnModuleInit {
	private tdClient: Client

	constructor(
		@Inject(MQTT_TOKEN)
		private readonly mqtt: CustomMqtt
	) {

	}

	async onModuleInit() {
		this.tdClient = await createClientAsync(config.topdelivery.url);
		this.tdClient.setSecurity(new BasicAuthSecurity(
			config.topdelivery.basic.user,
			config.topdelivery.basic.password
		));	
	}

	private generateAccessCode (order: Order) {
		const hash = createHash('md5')
		hash.update(`${order.orderIdentity.orderId}+${order.orderIdentity.barcode}`)
		return hash.digest('hex');
	}

	callConfirm = async (user: User, order: Order) => {
		const call: Call = {
			orderId: order.orderIdentity.orderId.toString(),
			phone: "",
			provider: Call.Provider.TOP_DELIVERY,
			status: Call.Status.COMPLETED,
			user
		}
		return this.mqtt.paranoid("call:add", call);
	}

	doneOrderPickup = async (params: { order: Order, pickupId: number }) => {
		const { order } = params;
		const payload: Partial<Order> = {
			accessCode: this.generateAccessCode(params.order),
			orderIdentity: order.orderIdentity,
			deliveryType: order.deliveryType,
			pickupAddress: order.pickupAddress,
			clientInfo: order.clientInfo
		}

		const [ response ] = await this.tdClient.changeOrderDeliveryTypeAsync({
			auth: config.topdelivery.body,
			deliveryTypeParams: payload
		});

		if (response.requestResult.status === 1) 
			throw new Error(response.requestResult.message);
	}

	doneOrder = async (params: { order: Order }) => {
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

		if (response.requestResult.status === 1) {
			throw new Error(response.requestResult.message);
		}
	}

	private readonly denyReasons = Object.freeze({
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

	denyOrder = async (params: { order: Order }) => {
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

		const [ response] = await this.tdClient.setOrdersFinalStatusAsync({
			auth: config.topdelivery.body,
			finalStatusParams: payload
		});

		if (response.requestResult.status === 1) 
			throw new Error(response.requestResult.message);
	}

	underCall = async (params: { order: Order }) => {
		const { order } = params;
		const payload: Partial<Order> = {
			accessCode: this.generateAccessCode(order),
			event: {
				eventType: {
					id: 20,
					name: "edit_by_cc"
				},
				comment: "Недоступен"
			}
		}
		const [ response] = await this.tdClient.addOrderEventAsync({
			auth: config.topdelivery.body,
			orderEvent: payload
		});
		if (response.requestResult.status === 1) 
			throw new Error(response.requestResult.message);
	}

	replaceCallDate = async (params: { order: Order, replaceDate: string }) => {
		const { order } = params;
		const payload: Partial<Order> = {
			accessCode: this.generateAccessCode(order),
			orderIdentity: order.orderIdentity,
			event: {
				eventType: {
					id: 20,
					name: "edit_by_cc"
				},
				comment: `Просит перезвонить позднее %${new Date(params.replaceDate).toLocaleDateString()}%`
			}
		}
		const [ response ] = await this.tdClient.addOrderEventAsync({
			auth: config.topdelivery.body,
			orderEvent: payload
		});
		if (response.requestResult.status === 1) 
			throw new Error(response.requestResult.message);
	}
}