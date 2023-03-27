import { mqttRegister, Stats } from "@betacall/svc-common";
import { Module } from "@nestjs/common";
import { ClientsModule } from "@nestjs/microservices";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StatsController } from "./stats.controller";
import { StatsService } from "./stats.service";

@Module({
	imports: [
		ClientsModule.register([mqttRegister]),
		TypeOrmModule.forFeature([Stats])
	],
	providers: [StatsService],
	controllers: [StatsController]
})
export class StatsModule {

}