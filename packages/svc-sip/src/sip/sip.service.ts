import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

@Injectable()
export class SipService implements OnModuleInit {

	private log = (msg: string) => {
		Logger.log('SIP: ' + msg);
	}

	onModuleInit() {
		
	}
}