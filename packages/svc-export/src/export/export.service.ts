import { Call, CustomMqtt, MQTT_TOKEN, Stats } from "@betacall/svc-common";
import { Inject, Injectable } from "@nestjs/common";
import { ObjectLiteral } from "typeorm";
import { WorkBook, WorkSheet, writeXLSX, utils } from 'xlsx';

@Injectable()
export class ExportService {

	constructor(
		@Inject(MQTT_TOKEN)
		private client: CustomMqtt
	) {

	}

	private getValueByPath (path: string, object: object) {
		const arrPath = path.split(".");
		let value: string | null = null;
		let n = 0;
		for (const p of arrPath) {
			value = (value || object)?.[p] || null;
			if (++n === arrPath.length && value) {
				return value;
			}
		}
		return null;
	}

	private getOrderID = (stat: Stats) => {
		if (stat.provider === Call.Provider.TOP_DELIVERY) {
			return this.getValueByPath('orderIdentity.orderId', stat.data);
		}
		if (stat.provider === Call.Provider.B2CPL_MANUAL) {
			return this.getValueByPath('callid', stat.data);
		}
		return null
	}

	private getOrderStatus = (stat: Stats) => {
		if (stat.provider === Call.Provider.TOP_DELIVERY) {
			return this.getValueByPath('workStatus.name', stat.data);
		}
		if (stat.provider === Call.Provider.B2CPL_MANUAL) {
			return this.getValueByPath('call_statuses.0.state', stat.data)
		}
		return null;
	}

	async exoprtStats (where: ObjectLiteral) {
		const stats: { list: Stats[], count: number } = await this.client.paranoid('stats:list', {
			where
		});

		const header: (string | null)[][] = [["ID", "PROVIDER", "DATE", "OPERATOR", "STATUS"]];
		const data: (string | null)[][] = stats.list.map(i => {
			return [
				this.getOrderID(i),
				i.provider,
				new Date(i.dt).toLocaleString(),
				i.user.login,
				this.getOrderStatus(i)
			]
		});

		const ws = utils.aoa_to_sheet([...header, ...data])
		const wb = utils.book_new();

		utils.book_append_sheet(wb, ws);

		const xlsx = writeXLSX(wb, {
			type: "buffer"
		});
	
		return xlsx;
	}
}