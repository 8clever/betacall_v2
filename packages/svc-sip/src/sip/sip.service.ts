import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Connection } from "./node-esl"
import { IEventCallback } from "./node-esl/src/esl/Connection";
import { config } from "@betacall/svc-common";
@Injectable()
export class SipService implements OnModuleInit {

	private fs: Connection;

	private handleReady = () => {
		this.log("Ready");
		this.fs.on('esl*', this.handleEvt);
		this.callSelf('1000')
	}

	private handleEvt: IEventCallback = (evt) => {
		console.log(evt['_body'])
	}

	private status = () => {
		this.fs.executeAsync('sofia', 'status', this.handleEvt)
	}


	callSelf = (phone: string) => {
		this.fs.bgapi(`originate sofia/internal/ext@192.168.89.149:56548`, [phone], this.handleEvt);
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
	}
}