import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AMI } from "./ami";
import { Call, config, CustomMqtt, MQTT_TOKEN } from '@betacall/svc-common';
import * as uuid from 'uuid'
import { RosReestr } from './rosreestr'

class GateAway {
	slots: number;
	channel: string;
	regex?: string;
	context?: string = "ringing";
	next: () => GateAway | null = () => null;
}


@Injectable()
export class AsteriskService implements OnModuleInit {

	constructor(
		@Inject(MQTT_TOKEN)
		private mqtt: CustomMqtt
	) {

	}

	gateaways = Object.keys(config.gateaways)

	ami = new AMI(
		config.ami.host,
		config.ami.port,
		config.ami.username,
		config.ami.password
	)

	private asteriskON = false;

	private rosreestr = new RosReestr();

	private async init() {
		const { ami } = this;

		return new Promise((resolve, reject) => {
			ami.on('error', function (err) {
				reject(err);
			});

			ami.on('ready', () => {

				ami.on("eventCoreShowChannelsComplete", evt => {
					ami.emit(evt.Event + evt.ActionID, evt);
				});

				ami.on("eventCoreShowChannel", evt => {
					ami.emit(evt.Event + evt.ActionID, evt);
				});

				ami.on("eventPeerStatus", evt => {
					this.asteriskON = evt.PeerStatus === "Registered";
				});

				ami.on("eventHangup", evt => {
					if (!(
						evt.Uniqueid
					)) return;

					if (
						evt.Cause === "0" ||
						evt.Cause === "1" ||
						evt.Cause === "16" ||
						evt.Cause === "17" ||
						evt.Cause === "18" ||
						evt.Cause === "19" ||
						evt.Cause === "20" ||
						evt.Cause === "21" ||
						evt.Cause === "22" ||
						evt.Cause === "34" ||
						evt.Cause === "38" ||
						evt.Cause === "58" ||
						evt.Cause === "127"
					) {
						ami.emit(evt.Uniqueid, {
							status: Call.Status.UNDER_CALL,
							id: evt.Uniqueid
						});
						return;
					}

					Logger.log(evt.Cause, evt["Cause-txt"]);
					ami.emit(evt.Uniqueid, {
						status: Call.Status.CONNECTING_PROBLEM,
						id: evt.Uniqueid
					});
				});

				ami.on("eventDialEnd", evt => {
					if (!(
						evt.Uniqueid &&
						evt.DialStatus === "ANSWER"
					)) return;

					ami.emit(evt.Uniqueid, {
						id: evt.Uniqueid,
						status: Call.Status.OPERATOR,
						userLogin: evt.DestCallerIDNum
					});
				});

				this.asteriskON = true;
				resolve(null);
			});

			ami.connect();
		})
	}

	private async lazy () {
		for (;;) {
			try {
				await this.init()
				return;
			} catch (e) {
				Logger.error(e)
			}
		}
	}

	async onModuleInit() {
		this.lazy();
	}

	private generateID() {
		return uuid.v4();
	}

	isOn() {
		return this.asteriskON;
	}

	call = async ({ phone, gateawayName, texts = [], vars = {} }: {
		phone: string;
		gateawayName: string;
		texts?: string[];
		vars?: Record<string, string | number>
	}): Promise<{ 
		status: Call.Status, 
		id: string;
		userLogin?: string;
	}> => {
		const id = this.generateID();
		const isOn = this.isOn();
		if (!isOn) return { id, status: Call.Status.CONNECTING_PROBLEM };

		const gateawayDefault = this.getGateawayByDefault(gateawayName)
		let gateaway = await this.getGateawayByPhone(phone);
		let isAvailable = false;

		gateaway = gateaway || gateawayDefault;

		while (gateaway && !isAvailable) {
			isAvailable = await this.gateawayIsAvailable(gateaway);
			if (!isAvailable) gateaway = gateaway.next();
		}

		if (!(gateaway && isAvailable)) return { id, status: Call.Status.CONNECTING_PROBLEM };

		const Variable = [];

		const makeVar = (key: string, val: string | number) => {
			Variable.push(`${key}="${val}"`);
		}

		let n = 1;
		for (const text of texts) {
			await this.mqtt.paranoid("textToSpeech", { text });
			makeVar(`text${n}`, text);
			n += 1;
		}

		for (const key of Object.keys(vars)) {
			makeVar(key, vars[key]);
		}

		return new Promise((resolve, reject) => {
			const { context } = gateaway;
			const channel = gateaway.channel.replace(/<phone>/, phone);

			this.ami.once(id, response => {
				resolve(response);
			});

			const originate = {
				Channel: channel,
				Context: context,
				Exten: config.ami.exten,
				Priority: '1',
				Async: true,
				CallerID: phone,
				ActionID: "service_call",
				ChannelId: id,
				Timeout: config.ami.timeout,
				Variable: Variable.join(",")
			}

			this.ami.action('Originate', originate, (data: { Response: string }) => {
					if (data.Response === 'Error') {
						reject(data);
					}
				}
			);
		});
	}

	releaseCall = async (callId: string) => {
		this.ami.emit(callId, {
			status: Call.Status.COMPLETED,
			id: callId
		});
		return true;
	}

	private getGateawayByDefault = function (gateawayName = "default") {
		const gate = config.gateaways[gateawayName]
		if (!gate) throw new Error("Alarm! Default GateAway not found " + gateawayName);

		const gateaway = new GateAway();
		Object.assign(gateaway, gate);
		return gateaway;
	}

	private getGateawayByPhone = async (phone: string) => {
		const info = this.rosreestr.getInfoByPhone(phone);
		if (!info) return null;

		let gateawayNum = 1;
		const gateaway = getGateaway();

		return gateaway || null;

		function getGateaway() {
			/** as example Билайн1, we can call from same operator as client use 
			 * for reduce call cost
			*/
			const name = `${info.operator}${gateawayNum}`;
			const gate = config.gateaways[name];
			if (!gate) return null;

			const gateaway = new GateAway();
			Object.assign(gateaway, gate);

			gateaway.next = () => {
				gateawayNum += 1;
				return getGateaway();
			}

			return gateaway;
		}
	}

	private gateawayIsAvailable = function (gateaway: GateAway): Promise<boolean> {
		return new Promise((res) => {

			this.ami.action("Command", {
				Command: "sip show channels"
			}, (data: { raw: string }) => {
				const [, domain] = gateaway.channel.split("@")
				const raw = data.raw;
				const lines = raw.split("\n");

				let awailSlots = gateaway.slots;

				for (const line of lines) {
					if (
						line.includes("Output") &&
						line.includes(domain) &&
						!line.includes("BYE")
					) {
						awailSlots--;
					}
				}

				res(awailSlots > 0)
			})
		});
	}
}