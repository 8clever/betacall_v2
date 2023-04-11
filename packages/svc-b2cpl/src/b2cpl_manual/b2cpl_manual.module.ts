import { mqttRegister } from "@betacall/svc-common";
import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { B2CPLManualService } from "./b2cpl_manual.service";
import { B2CPLManualController } from "./b2cpl_manual.controller";

@Module({
	imports: [
		ClientsModule.register([ mqttRegister ])
	],
	providers: [
		B2CPLManualService
	],
	controllers: [
		B2CPLManualController
	]
})
export class B2CPLManualModule {}