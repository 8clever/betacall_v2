import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm'
import { Call, CustomMqtt, MQTT_TOKEN, User } from "@betacall/svc-common"
import { IsNull, Repository } from 'typeorm'

@Injectable()
export class CallerService {

  constructor(
    @InjectRepository(Call)
    public repo: Repository<Call>,
    @Inject(MQTT_TOKEN)
    private mqtt: CustomMqtt
  ) {}

  async getOperatorOrders (user: User) {
    const calls: Call[] = await this.findLastOrderStatus().where({ 
      user,
      status: Call.Status.OPERATOR,
      history: IsNull()
    }).getMany();
    const callsByProviders: Map<Call.Provider, Call[]> = new Map();
    for (const call of calls) {
      const arr = callsByProviders.get(call.provider) || [];
      arr.push(call);
      callsByProviders.set(call.provider, arr);
    }
    const promises: Promise<object[]>[] = [];
    for (const [provider, calls] of callsByProviders) {
      const orderids = calls.map(c => c.orderId);
      const promise = this.mqtt.paranoid(`${provider}:getOrdersByIds`, orderids);
      promises.push(promise)
    }
    const result = await Promise.all(promises);
    return result.flat();
  }

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