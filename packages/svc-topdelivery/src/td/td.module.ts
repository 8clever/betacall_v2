import { mqttRegister } from '@betacall/svc-common';
import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices';
import { TopDeliveryController } from './td.controller';
import { TopDeliveryService } from './td.service';

@Module({
	imports: [
		ClientsModule.register([mqttRegister])
	],
	providers: [TopDeliveryService],
	controllers: [TopDeliveryController]
})
export class TopDeliveryModule {

}