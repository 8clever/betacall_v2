import { mqttRegister } from "@betacall/svc-common";
import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { B2CPLService } from "./b2cpl.service";
import { B2CPLController } from "./b2cpl.controller";

@Module({
	imports: [
		ClientsModule.register([ mqttRegister ])
	],
	providers: [
		B2CPLService
	],
	controllers: [
		B2CPLController
	]
})
export class B2CPLModule {}