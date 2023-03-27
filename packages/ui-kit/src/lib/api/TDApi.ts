import { Api } from "./Api";
import { Provider } from "./types";


export class TDApi {
	api = new Api(`api/v1/${Provider.TOP_DELIVERY}`);

	getDenyReasons = async () => {
		return this.api.get('/deny-reasons', {});
	}

	getHistory = async (params: { orderId: string }): Promise<TDApi.History[]> => {
		return this.api.get("/history", params);
	}

	getPickupPoints = async (params: { partnerId: string }): Promise<TDApi.PickupPoint[]> => {
		return this.api.get("/pickup-points", params);
	}

	getNearDeliveryDatesIntervals = async (params: { id: string }): Promise<TDApi.Quota[]> => {
		return this.api.get("/near-delivery-dates-intervals", params);
	}

	doneOrderPickup = async (order: TDApi.Order, pickupId: number) => {
		return this.api.post("/done-order-pickup", { order, pickupId });
	}

	doneOrder = async (order: TDApi.Order) => {
		return this.api.post("/done-order", { order });
	}

	denyOrder = async (order: TDApi.Order) => {
		return this.api.post("/deny-order", { order });
	}

	underCall = async (order: TDApi.Order) => {
		return this.api.post("/undercall-order", { order })
	}

	replaceCall = async (order: TDApi.Order, replaceDate: Date) => {
		return this.api.post("/replacedate-order", { order, replaceDate })
	}
}

export namespace TDApi {

	export interface HistoryEvent {
		city :{ id: number, name: string }
		comment: string;
		date: string;
		eventId: number;
		eventType: { id: number, name: string }
		newValue: string;
		prevValue: string;
		region: {id: number, name: string }
		user: string;
	}
	export interface History {
		events: HistoryEvent[]
	}

	export interface TimeInterval {
		bTime: string; // HH:mm:ss time from
		eTime: string; // HH:mm:ss time to
	}
	
	export interface Quota {
		date: string;
		quotas: {
			available: number;
		}
		timeInterval: TimeInterval[];
	}

	export interface PickupPoint {
		locationId: string;
		cityOfLocation: string;
		addressOfLocation: string;
	}

	export enum PickupType {
		PICKUP = "PICKUP",
		COURIER = 'COURIER'
	}

	export interface Order {
		clientFullCost: string;
		endOfStorageDate: string;
		orderUrl: string;
		orderIdentity: {
			orderId: number;
			barcode: string;
			webshopNumber: string;
		},
		accessCode: string;
		deliveryType: PickupType,
		deliveryAddress: {
			region: string;
			inCityAddress: string;
		},
		pickupAddress: {
			id: number;
		},
		partnerExecutor: {
			id: number;
		},
		clientInfo: {
			phone: string;
		},
		clientAddress: string;
		workStatus: {
			id: number;
			name: string;
		},
		denyParams: {
			type: string;
			reason: {
				id: number;
				name: string;
			}
		},
		event: {
			eventType: {
				id: number,
				name: string;
			},
			comment: string;
		},
		desiredDateDelivery: {
			date: string;
			timeInterval: {
				bTime: string;
				eTime: string;
			}
		};
		pickupPoints: PickupPoint[],
		status: {
			name: string;
		}
	}
}