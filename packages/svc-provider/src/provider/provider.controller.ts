import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ProviderService } from "./provider.service";
import { AuthGuard, Provider, Roles, User } from "@betacall/svc-common";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller()
export class ProviderController {

	constructor(
		private providersvc: ProviderService
	) {}

	@MessagePattern('provider:apikey')
	async getProviderByApiKey (@Payload() payload: string) {
		const providers = await this.providersvc.getProviders({
			where: {
				apiKey: payload
			}
		});
		return providers[0] || null;
	}

	@Roles(User.Roles.ADMIN)
	@UseGuards(AuthGuard)
	@Delete('/delete/:id')
	async deleteProvider (@Param("id") id: string) {
		return this.providersvc.deleteProvider(id);
	}

	@Roles(User.Roles.ADMIN)
	@UseGuards(AuthGuard)
	@Post('/save')
	async saveProvider (@Body() body: Provider) {
		return this.providersvc.saveProvider(body);
	}

	@Roles(User.Roles.ADMIN)
	@UseGuards(AuthGuard)
	@Get("/list")
	async getProviderList () {
		return this.providersvc.getProviders();
	}
}