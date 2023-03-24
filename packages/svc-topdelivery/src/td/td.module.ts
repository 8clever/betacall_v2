import { Module } from '@nestjs/common'
import { TopDeliveryController } from './td.controller';
import { TopDeliveryService } from './td.service';

@Module({
	providers: [TopDeliveryService],
	controllers: [TopDeliveryController]
})
export class TopDeliveryModule {

}