import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { UA } from 'jssip';
import https from 'https';
import NodeWebSocket from 'jssip-node-websocket';

const switchConfig = {
	url: 'wss://192.168.1.30:7443',
	user: 'sip:9999@test.lan',
	password: "9999"
}

@Injectable()
export class SipService implements OnModuleInit {

	private socket = new NodeWebSocket(switchConfig.url, {
		origin: "localhost",
		requestOptions :
    {
      agent : new https.Agent({ rejectUnauthorized: false })
    }
	});

	private ua = new UA({
		uri          : switchConfig.user,
		password     : switchConfig.password,
    display_name : "Robot",
    sockets      : [ this.socket ]
	})

	private log = (msg: string) => {
		Logger.log('SIP: ' + msg);
	}

	handleRegistered = () => {
		this.log('registered');
		this.ua.call('sip:89585005602@freesw1', {

		})
	}

	onModuleInit() {
		this.ua.on('registered', this.handleRegistered);
		this.ua.on('connected', () => this.log('connected'))
		this.ua.on('disconnected', () => this.log('disconnected'))
		this.ua.on('unregistered', () => this.log('unregistered'));
		this.ua.on('registrationFailed', () => this.log('registration-failed'));
		this.ua.start();
	}
}