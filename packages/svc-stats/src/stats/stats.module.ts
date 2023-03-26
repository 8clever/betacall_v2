import { Stats } from "@betacall/svc-common";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([Stats])
	],
	providers: [StatsService],
	controllers: [StatsController]
})
export class StatsModule {

}