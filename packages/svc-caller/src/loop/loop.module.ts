import { Module } from "@nestjs/common";
import { AsteriskModule } from "../asterisk/asterisk.module";
import { CallerModule } from "../caller/caller.module";
import { LoopController } from "./loop.controller";
import { LoopGateway } from "./loop.gateway";
import { LoopService } from "./loop.service";

@Module({
	imports: [CallerModule, AsteriskModule],
	providers: [LoopService, LoopGateway],
	controllers: [LoopController],
})
export class LoopModule {}