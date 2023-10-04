import { mqttRegister } from '@betacall/svc-common';
import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices';
import { ExternalController } from './external.controller';
import { LoopModule } from '../loop/loop.module';

@Module({
  imports: [
    LoopModule,
    ClientsModule.register([mqttRegister]),
  ],
  controllers: [ExternalController]
})
export class ExternalModule {}