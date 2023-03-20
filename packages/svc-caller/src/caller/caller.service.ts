import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm'
import { Call, config } from "@betacall/svc-common"
import { Repository } from 'typeorm'
import { createClient } from 'redis'

@Injectable()
export class CallerService implements OnModuleInit {

  private redis = createClient({
    url: config.redisUrl
  });

  constructor(
    @InjectRepository(Call)
    private callRepo: Repository<Call>,
  ) {}

  private CALL_QUEUE = 'call-queue'

  async onModuleInit() {
    await this.redis.connect();
  }

  findLastOrderStatus(where: Partial<Call> | string) {
    return this.callRepo
      .createQueryBuilder("call")
      .distinctOn(['call.orderId'])
      .orderBy('call.orderId, dt desc, id')
      .where(where)
      .getMany()
  }

  find(where: Partial<Call>) {
    return this.callRepo.find({ where });
  }

  save (data: Partial<Call>) {
    return this.callRepo.save(data);
  }
}