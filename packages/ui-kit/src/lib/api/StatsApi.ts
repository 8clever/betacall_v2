import { Api } from "./Api";
import { Provider } from "./types";
import { UserApi } from "./UserApi";

export class StatsApi {
	api = new Api('/api/v1/stats');

	getList = async (query: { skip?: number, limit?: number, user?: string }) => {
		return this.api.get("", query)
	}
}

export namespace StatsApi {

	export interface Stat<T extends object = object> {
		id: string;
		user: UserApi.User,
		provider: Provider,
		data: object;
		dt: Date;
	}

}