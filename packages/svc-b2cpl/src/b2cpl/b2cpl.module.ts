import { mqttRegister } from "@betacall/svc-common";
import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";

@Module({
	imports: [
		ClientsModule.register([ mqttRegister ])
	]
})
export class B2CPLModule {}