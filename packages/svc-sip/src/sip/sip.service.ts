import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Connection, Event } from "./node-esl-src"
import { config } from "@betacall/svc-common";
import { EventEmitter } from "stream";
import { v4 as uid } from 'uuid';
import { WebSocket } from 'ws';
import { createReadStream } from "fs";
import path from "path";

interface HandleCallEvents {
	callid: string;
	answer?: () => Promise<void>;
	hangup?: () => Promise<void>;
}

@Injectable()
export class SipService implements OnModuleInit {

	private fs: Connection;

	private handleConnect = () => {
		this.fs.subscribe([
			"ALL"
		], this.handleReady)
	}

	private logEvent = (name: string, e: Event) => {
		console.log(
			name, 
			e.getType(), 
			e.getHeader('Channel-State'), 
			e.getHeader("Channel-Call-State"),
			e.getHeader("Answer-State")
		);
	}

	private handleCallEvents = (params: HandleCallEvents) => {
		this.events.on(params.callid, async (e: Event) => {
			const type = e.getType();

			this.logEvent("CALL: ", e);
			
			if (type === "CHANNEL_ANSWER") {
				await params.answer?.();
			}

			if (type === "CHANNEL_HANGUP") {
				await params.hangup?.();
				this.events.off(params.callid, this.handleCallEvents);
			}
		})
	}

	private bridge = async (from: string, target: string) => {
		const id = uid();
		this.fs.bgapi('uuid_bridge', `${from} ${target}`, id);
		const evt = await this.result(id);
		return this.getMessage(evt);
	}

	private handleReady = async () => {
		this.log("Ready");
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
		if (!evt) return;
		const evtName = evt.getType();
		const uid = evt.getHeader('Unique-ID');

		if (!this.events.listenerCount(uid)) {
			this.logEvent('OTHER: ', evt);
		}

		if (uid) {
			this.events.emit(uid, evt);
			return;
		}

		if (evtName === "BACKGROUND_JOB") {
			const jobid = evt.getHeader('Job-UUID');
			this.events.emit(jobid, evt);
			return;
		}
	}

	private async originate (url: string, phone: string = '') {
		const id = uid();
		this.log(`Originate: ${id}`);
		this.fs.bgapi('originate', `[origination_uuid=${id}]${url} ${phone} &park()`, id);
		return id;
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

	private call = (phone: string) => {
		if (phone.length > 4)
			return this.callExternal(phone);
		return this.callUser(phone);
	}

	private callUser = async (phone: string) => {
		return this.originate(`user/${phone}`);
	}

	private callExternal = async (phone: string) => {
		return this.originate(`sofia/gateway/freesw1/${phone}`);
	}

	private log = (msg: string) => {
		Logger.log('SIP: ' + msg);
	}

	private connect () {
		this.fs = Connection.createInbound(config.sip, config.sip.password, this.handleConnect)
		this.fs.on('esl::**', this.handleAllEvents)
	}

	private vosk = new WebSocket('ws://192.168.1.26:2700/asr/ru');
	private rtmp = new WebSocket('ws://192.168.1.30:1935')

	private streamAudio () {

	}

	private handleVoskConnected = () => {
		this.log('Vosk connected');
		const readStream = createReadStream(path.join(__dirname, 'assets/sokol.wav'));
		readStream.on('data', (buff) => {
			this.vosk.send(buff);
		})
		readStream.on('end', () => {
			const data = { eof: 1 }
			this.vosk.send(JSON.stringify(data));
		})
	}

	private handleRTMPConnected = () => {
		this.log('RTMP connected');
	}

	private handleVoskMessage = (evt: Buffer) => {
		const text = evt.toString();
		console.log(text)
	}

	onModuleInit() {
		this.connect();
		this.vosk.on('open', this.handleVoskConnected);
		this.vosk.on('message', this.handleVoskMessage);
		this.rtmp.on('open', this.handleRTMPConnected);
	}
}