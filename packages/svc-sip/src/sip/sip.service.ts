import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Connection, Event } from "./node-esl-src"
import { config } from "@betacall/svc-common";
import { EventEmitter } from "stream";
import { v4 as uid } from 'uuid';

@Injectable()
export class SipService implements OnModuleInit {

	private fs: Connection;

	private handleReady = () => {
		this.fs.subscribe([
			'CHANNEL_DESTROY',
			'CHANNEL_CREATE',
			"CHANNEL_STATE",
			"BACKGROUND_JOB"
		], () => {
			this.log("Ready");
			this.callExternal('89585005602');
		})
	}

	private getMessage = (e: Event) => {
		const [ status, ...data ] = e.getBody().split(' ');
		return {
			status,
			isError: status === "-ERR" || status === "-USAGE:",
			data: data.join(' ').replace('\n', '')
		}
	}

	private events = new EventEmitter();

	private handleAllEvents = (evt: Event) => {
		const evtName = evt.getType();
		if (evtName === "BACKGROUND_JOB") {
			const uuid = evt.getHeader('Job-UUID');
			this.events.emit(uuid, evt);
		}
	}

	private async originate (url: string, phone: string = '') {
		const id = uid();
		this.fs.bgapi('originate', `${url} ${phone} &park()`, id);
		const evt = await this.result(id);
		const msg = this.getMessage(evt);
		if (msg.isError)
			throw new Error(msg.data);
		return msg.data;
	}

	private async playRecord (uuid: string) {
		const id = uid();
		const app = 'uuid_broadcast'
		const cmd = `${uuid} /usr/share/freeswitch/sounds/transfer1.wav both`
		this.fs.bgapi(app, cmd, id);
		const evt = await this.result(id);
		return this.getMessage(evt);
	}

	private result (uid: string): Promise<Event> {
		return new Promise((res) => {
			this.events.once(uid, res);
		});
	}

	private callUser = async (phone: string) => {
		const callid = await this.originate(`user/${phone}`);
		await this.playRecord(callid);
	}

	private callExternal = async (phone: string) => {
		const callid = await this.originate('sofia/gateway/freesw1/ext', phone);
		await this.playRecord(callid);
	}

	private log = (msg: string) => {
		Logger.log('SIP: ' + msg);
	}

	private connect () {
		this.fs = Connection.createInbound(config.sip, config.sip.password, this.handleReady)
		this.fs.on('esl::event::**', this.handleAllEvents)
	}

	onModuleInit() {
		this.connect();
	}
}