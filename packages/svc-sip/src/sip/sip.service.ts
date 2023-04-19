import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Connection, Event } from "./node-esl"
import { IEventCallback } from "./node-esl/src/esl/Connection";
import { config } from "@betacall/svc-common";
import { EventEmitter } from "stream";
@Injectable()
export class SipService implements OnModuleInit {

	private fs: Connection;

	private handleReady = () => {
		this.log("Ready");
		this.fs.on('esl::event', this.handleEvt)
		this.callSelf('1000')
	}

	private events = new EventEmitter();

	private handleEvt = (evt: Event) => {
		const evtName = evt.getType();
		console.log(evtName)
		const [ status, message ] = evt.getBody().split(" ") as string[];
		if (status === "-ERR")
			throw new Error(message);

		return message;
	}

	handleCall: IEventCallback = (e) => {
		const uid = this.handleEvt(e);
		this.fs.execute('playback', '/usr/share/freeswitch/sounds/transfer1.wav', uid, this.handleEvt);
	}

	callSelf = (phone: string) => {
		this.fs.api('originate', `sofia/internal/ext@192.168.89.149:56548 ${phone}`, this.handleCall);
		this.fs.execute('playback', '/usr/share/freeswitch/sounds/transfer1.wav', this.handleEvt);
		return;
		this.fs.bgapi('originate', `sofia/internal/ext@192.168.89.149:56548 ${phone}`, this.handleCall);
	}

	callExternal = (phone: string) => {
		this.fs.bgapi(`originate sofia/gateway/freesw1/${phone} &park()`, this.handleEvt);
	}

	private log = (msg: string) => {
		Logger.log('SIP: ' + msg);
	}

	onModuleInit() {
		this.fs = Connection.createInbound({
			host: config.sip.host,
			port: config.sip.port
		}, config.sip.password, this.handleReady)
		this.fs.subscribe([
			'CHANNEL_CREATE',
			'CHANNEL_CALLSTATE',
			// 'CHANNEL_STATE',
			// 'CHANNEL_EXECUTE',
			// 'CHANNEL_EXECUTE_COMPLETE',
			'CHANNEL_DESTROY'
		]);
		this.fs.on('esl::event::**', this.handleEvt)
	}
}