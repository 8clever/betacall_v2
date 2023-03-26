import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm'
import { Call, CustomMqtt, MQTT_TOKEN, User } from "@betacall/svc-common"
import { In, IsNull, Not, Repository } from 'typeorm'

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

    const orders: { order: object, provider: Call.Provider }[] = [];
    
    for (const [provider, calls] of callsByProviders) {
      const orderids = calls.map(c => c.orderId);
      const providerOrders: object[] = await this.mqtt.paranoid(`${provider}:getOrdersByIds`, orderids);
      for (const o of providerOrders) {
        orders.push({
          provider,
          order: o
        });
      }
    }
    
    return orders;
  }

  findLastOrderStatus() {
    return this.repo
      .createQueryBuilder('call')
      .distinctOn(['call.orderId'])
      .orderBy('call.orderId, dt desc, id')
  }

  queryList = (provider: Call.Provider, calls: Pick<Call, 'orderId' | 'provider'>[], not = false) => {
    const orderids = calls.map(c => c.orderId);
    return {
      orderId: not ? Not(In(orderids)) : In(orderids),
      provider,
      history: IsNull()
    }
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