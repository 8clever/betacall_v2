import { Api } from "./Api";
import { Provider } from "./types";


export class TDApi {
	api = new Api(`api/v1/${Provider.TOP_DELIVERY}`);

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

	replaceCall = async (order: TDApi.Order, replaceDate: number) => {
		return this.api.post("replacedate-order", { order, replaceDate })
	}
}

export namespace TDApi {
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

	export interface Order {
		orderIdentity: {
			orderId: number;
			barcode: string;
		},
		accessCode: string;
		deliveryType: object,
		deliveryAddress: {
			region: string;
			inCityAddress: string;
		},
		pickupAddress: {
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
	}
}