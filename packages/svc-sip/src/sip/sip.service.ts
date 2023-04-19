import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Connection, Event } from "./node-esl-src"
import { config } from "@betacall/svc-common";
import { EventEmitter } from "stream";

type IEventCallback = (e: Event) => void;

@Injectable()
export class SipService implements OnModuleInit {

	private fs: Connection;

	private handleReady = () => {
		this.log("Ready");
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

	private handleCall: IEventCallback = (e) => {
		const uid = this.handleEvt(e);
		this.fs.execute('playback', '/usr/share/freeswitch/sounds/transfer1.wav', uid);
	}

	private callSelf = (phone: string) => {
		const uid = this.fs.api('originate', [`sofia/internal/ext@192.168.89.249:61924 ${phone}`]);
		this.fs.execute('playback', '/usr/share/freeswitch/sounds/transfer1.wav');
		return;
		this.fs.bgapi('originate', [`sofia/internal/ext@192.168.89.149:56548 ${phone}`]);
	}

	private callExternal = (phone: string) => {
		this.fs.bgapi('originate', [`sofia/gateway/freesw1/${phone} &park()`]);
	}

	private log = (msg: string) => {
		Logger.log('SIP: ' + msg);
	}

	private connect () {
		this.fs = Connection.createInbound(config.sip, config.sip.password, this.handleReady)
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

	onModuleInit() {
		this.connect();
	}
}