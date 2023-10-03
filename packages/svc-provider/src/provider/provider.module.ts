
import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { mqttRegister } from "@betacall/svc-common";
import { ProviderService } from "./provider.service";
import { ProviderController } from "./provider.controller";

@Module({
	imports: [
		ClientsModule.register([mqttRegister])
	],
	providers: [
		ProviderService
	],
	controllers: [
		ProviderController
	]
})
export class ProviderModule {

}