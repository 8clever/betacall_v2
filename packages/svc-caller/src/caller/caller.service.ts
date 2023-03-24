import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm'
import { Call } from "@betacall/svc-common"
import { Repository } from 'typeorm'

@Injectable()
export class CallerService {

  constructor(
    @InjectRepository(Call)
    public repo: Repository<Call>,
  ) {}

  findLastOrderStatus() {
    return this.repo
      .createQueryBuilder('call')
      .distinctOn(['call.orderId'])
      .orderBy('call.orderId, dt desc, id')
  }

  queryList = (provider: Call.Provider, calls: Pick<Call, 'orderId' | 'provider'>[], not = false) => {
    return `call."orderId" ${not ? "not" : ""} in (${calls.map(c => `'${c.orderId}'`).join(",")}) and call.provider = '${provider}' and call.history is null`;
  }

  find(where: Partial<Call>) {
    return this.repo.find({ where });
  }

  add (d: Partial<Call>) {
    const data = {...d}
    delete data.id;
    return this.save(data);
  }

  save (data: Partial<Call>) {
    delete data.dt;
    return this.repo.save(data);
  }
}