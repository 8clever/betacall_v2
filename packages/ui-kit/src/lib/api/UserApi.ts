import { Api } from "./Api";

export class UserApi {

	users = new Api('/api/v1/users')

	static GoToAuth = () => {
    window.location.href = encodeURI('/auth/signin?backUrl=' + window.location.href)
	}

	static Logout = () => {
		localStorage.removeItem(Api.ACCESS_TOKEN);
		UserApi.GoToAuth();
	}

	async signin (user: UserApi.SignIn) {
		const dto = await this.users.post('/auth/login', user);
		localStorage.setItem(Api.ACCESS_TOKEN, dto.access_token)
	}

	async me () {
		const me = await this.users.get('/me', {});
		return me;
	}

	async edit (user: UserApi.User) {
		return this.users.post("/edit", user);
	}

	async list (query: Partial<UserApi.User> & { limit?: number, skip?: number }) {
		return this.users.get("", query);
	}

	async delete (id: string) {
		return this.users.delete("/" + id);
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