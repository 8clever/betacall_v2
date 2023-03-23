import { notification } from 'antd';
import qs from 'querystring';

export class Api {

	static readonly ACCESS_TOKEN = 'access_token';

	constructor (private baseUrl: string) {

	}

	private getHeaders () {
		return {
			Authorization: `Bearer ${localStorage.getItem(Api.ACCESS_TOKEN)}`
		}
	}

	private async handleRes (res: Response) {
		const isjson = res.headers.get('content-type')?.includes('application/json');
		if (res.status === 200 || res.status === 201) {
			if (isjson)
				return res.json();
			return;
		}
		let message = res.statusText || res.status;
		if (isjson) {
			const data = await res.json();
			if (data.message)
				message = data.message;
			if (data.error)
				message = data.error;
		}
		notification.error({ message });
		throw new Error(res.statusText);
	}

	async get (path: string, query: object) {
		const queryString = qs.stringify(query as qs.ParsedUrlQueryInput);
		const res = await fetch(`${this.baseUrl}${path}?${queryString}`, {
			headers: this.getHeaders(),
			credentials: 'include'
		});
		return this.handleRes(res);
	}

	async post (path: string, body: object) {
		const res = await fetch(`${this.baseUrl}${path}`, {
			method: "POST",
			credentials: "include",
			body: JSON.stringify(body),
			headers: {
				...this.getHeaders(),
				'Content-Type': 'application/json'
			}
		})
		return this.handleRes(res);
	}

	async delete (path: string) {
		const res = await fetch(`${this.baseUrl}${path}`, {
			method: "DELETE",
			headers: this.getHeaders(),
			credentials: 'include'
		});
		return this.handleRes(res);
	}

}