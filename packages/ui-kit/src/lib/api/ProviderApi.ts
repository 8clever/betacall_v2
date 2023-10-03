import { Api } from "./Api";

export class ProviderApi {
	private api = new Api('/api/v1/provider');

	getProviders = (): Promise<ProviderApi.Provider[]> => {
		return this.api.get('/list', {});
	}

	saveProvider (params: ProviderApi.Provider) {
		return this.api.post('/save', params);
	}

	removeProvider (id: string) {
		return this.api.delete('/delete/' + id);
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