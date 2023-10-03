import { Controller, Get, UseGuards } from "@nestjs/common";
import { ProviderService } from "./provider.service";
import { AuthGuard, Roles, User } from "@betacall/svc-common";

@Controller()
export class ProviderController {

	constructor(
		private providersvc: ProviderService
	) {}

	@Roles(User.Roles.ADMIN)
	@UseGuards(AuthGuard)
	@Get("/list")
	async getProviderList () {
		return this.providersvc.getProviders();
	}
}