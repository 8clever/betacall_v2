import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm'
import { Call } from "@betacall/svc-common"
import { Repository } from 'typeorm'

@Injectable()
export class CallerService implements OnModuleInit {
  constructor(
    @InjectRepository(Call)
    private callRepo: Repository<Call>,
  ) {}

  async onModuleInit() {
  }

  findLastOrderStatus(where: Partial<Call>) {
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