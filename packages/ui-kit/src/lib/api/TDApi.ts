import { Api } from "./Api";
import { Provider } from "./types";


export class TDApi {
	api = new Api(`api/v1/${Provider.TOP_DELIVERY}`);

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
	export interface Order {

	}
}