import { Api } from "./Api";

export class ProviderApi {
	private api = new Api('/api/v1/provider');

	getProviders () {
		return this.api.get('/list', {});
	}
}

export namespace ProviderApi {

	export interface Provider {
		id?: string;
		key: string;
		name: string;
		internal?: boolean
		apiKey?: string;
	}
}