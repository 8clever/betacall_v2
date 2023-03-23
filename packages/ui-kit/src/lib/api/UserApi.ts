import { Api } from "./Api";

export class UserApi {

	users = new Api('/api/v1/users')

	async signin (user: UserApi.SignIn) {
		const dto = await this.users.post('/auth/login', user);
		localStorage.setItem('access_token', dto.access_token)
	}

	async me () {
		const me = await this.users.get('/me', {});
		return me;
	}
}

export namespace UserApi {

	export interface SignIn {
		username: string;
		password: string;
	}

	export enum Role {
		ADMIN = "admin",
		OPERATOR = "operator"
	}

	export interface User {
		id: string;
		login: string;
		role: Role
	}
}