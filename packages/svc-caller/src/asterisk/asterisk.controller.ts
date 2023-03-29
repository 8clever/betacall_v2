import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AsteriskService } from "./asterisk.service";

@Controller()
export class AsteriskController {

	constructor(
		private asterisksvc: AsteriskService
	) {}

	@MessagePattern("asterisk:release-call")
	releaseCall (@Payload() callid: string ) {
		return this.asterisksvc.releaseCall(callid);
	}
}