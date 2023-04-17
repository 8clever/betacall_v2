import { Injectable, OnModuleInit } from "@nestjs/common";
import { UA } from 'jssip';
import https from 'https';
import NodeWebSocket from 'jssip-node-websocket';

@Injectable()
export class SipService implements OnModuleInit {

	private socket = new NodeWebSocket('wss://192.168.1.2:5060', {
		origin: "localhost",
		requestOptions :
    {
      agent : new https.Agent({ rejectUnauthorized: false })
    }
	});

	private ua = new UA({
		uri          : 'sip:alice@voip1',
    display_name : 'Alice',
    sockets      : [ this.socket ]
	})

	onModuleInit() {
		this.ua.on('newMessage', msg => {
			console.log('msg', msg);
		})
		this.ua.on('sipEvent', evt => {
			console.log('sip evt: ', evt)
		})
		this.ua.on('connected', () => {
			console.log("connected")
		})
		this.ua.on('disconnected', (e) => {
			console.log('disconnected', e)
		})
		this.ua.on('registered', () => console.log('registered'));
		this.ua.on('unregistered', () => console.log('unregistered'));
		this.ua.on('registrationFailed', () => console.log('registration-failed'));
		this.ua.start();
	}
}