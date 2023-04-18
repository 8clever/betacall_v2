import { Module } from "@nestjs/common";
import { ExportService } from "./export.service";
import { ExportController } from "./export.controller";
import { ClientsModule } from "@nestjs/microservices";
import { mqttRegister } from "@betacall/svc-common";

@Module({
	imports: [
		ClientsModule.register([mqttRegister])
	],
	providers: [
		ExportService
	],
	controllers: [
		ExportController
	]
})
export class ExportModule {

}