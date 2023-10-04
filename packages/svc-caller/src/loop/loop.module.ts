import { mqttRegister } from "@betacall/svc-common";
import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { AsteriskModule } from "../asterisk/asterisk.module";
import { CallerModule } from "../caller/caller.module";
import { LoopController } from "./loop.controller";
import { LoopGateway } from "./loop.gateway";
import { LoopService } from "./loop.service";

@Module({
	imports: [CallerModule, AsteriskModule, ClientsModule.register([mqttRegister])],
	providers: [LoopService, LoopGateway],
	controllers: [LoopController],
	exports: [LoopService]
})
export class LoopModule {}