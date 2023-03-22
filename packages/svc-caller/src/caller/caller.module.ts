import { Call, mqttRegister } from '@betacall/svc-common';
import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsteriskModule } from '../asterisk/asterisk.module';
import { CallerController } from './caller.controller';
import { CallerGateaway } from './caller.gateaway';
import { CallerService } from './caller.service';

@Module({
  imports: [
    ClientsModule.register([mqttRegister]), 
    TypeOrmModule.forFeature([Call]),
    AsteriskModule
  ],
  controllers: [CallerController],
  providers: [CallerService, CallerGateaway]
})
export class CallerModule {}