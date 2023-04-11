import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm'
import { Call, CustomMqtt, MQTT_TOKEN, User } from "@betacall/svc-common"
import { Repository } from 'typeorm'

@Injectable()
export class CallerService {

  constructor(
    @InjectRepository(Call)
    public repo: Repository<Call>,
    @Inject(MQTT_TOKEN)
    private mqtt: CustomMqtt
  ) {}

  assignOrder = async (params: { user: User, orderId: string, provider: Call.Provider }) => {
    await this.add({
      ...params,
      status: Call.Status.OPERATOR,
      phone: "",
      region: ""
    });
    return true;
  }

  async getOperatorOrders (user: User) {
    const calls: Call[] = await this.findLastOrderStatus({ where2: `"userId"='${user.id}' and status='${Call.Status.OPERATOR}'` });
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

  private getWhereAnd (str = "") {
    return str ? `AND ${str}` : "";
  }

  findLastOrderStatus(params: { where1?: string, where2?: string }): Promise<Call[]> {
    return this.repo.query(`
      WITH last_call AS (
        SELECT *, ROW_NUMBER() OVER(PARTITION BY "orderId" ORDER BY "dt" desc) as idx 
        FROM call
        WHERE history ISNULL ${this.getWhereAnd(params.where1)}
      )
      SELECT * FROM last_call
      WHERE idx=1 ${this.getWhereAnd(params.where2)}
    `)
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