import { Api } from "./Api";
import { Provider } from "./types";

export class ExportApi {

	api = new Api('/api/v1/export')

	stats (query: {
		provider: Provider;
		from: string;
		to: string;
	}) {
		return this.api.get('/stats', query);
	}
}