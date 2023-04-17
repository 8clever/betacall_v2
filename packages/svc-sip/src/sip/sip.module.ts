import { mqttRegister } from "@betacall/svc-common";
import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { SipService } from "./sip.service";
import { SipController } from "./sip.controller";

@Module({
	imports: [
		ClientsModule.register([mqttRegister])
	],
	providers: [
		SipService
	],
	controllers: [
		SipController
	]
})
export class SipModule {}