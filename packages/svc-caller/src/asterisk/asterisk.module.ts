import { mqttRegister } from "@betacall/svc-common";
import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { AsteriskService } from "./asterisk.service";

@Module({
	imports: [ClientsModule.register([mqttRegister])],
	providers: [AsteriskService],
	exports: [AsteriskService]
})
export class AsteriskModule {}