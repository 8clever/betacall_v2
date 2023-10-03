
import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { Provider, mqttRegister } from "@betacall/svc-common";
import { ProviderService } from "./provider.service";
import { ProviderController } from "./provider.controller";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
	imports: [
		ClientsModule.register([mqttRegister]),
		TypeOrmModule.forFeature([Provider])
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