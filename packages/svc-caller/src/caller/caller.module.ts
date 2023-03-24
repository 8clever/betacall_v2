import { Call } from '@betacall/svc-common';
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallerController } from './caller.controller';
import { CallerService } from './caller.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Call])
  ],
  controllers: [CallerController],
  providers: [CallerService],
  exports: [CallerService]
})
export class CallerModule {}