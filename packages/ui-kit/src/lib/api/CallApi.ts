import { Api } from "./Api";
import { Provider } from "./types";

export class CallApi {

	api = new Api('/api/v1/caller');

	getMyOrders = async (): Promise<CallApi.MyOrder[]> => {
		return this.api.get("/my-orders", {});
	}

	assignOrder = async (params: { id: string, provider: Provider }) => {
		return this.api.get('/assign-order', params);
	}
}

export namespace CallApi {

	export interface Call {

	}

	export interface MyOrder {
		provider: Provider,
		order: object
	}
}