import { Call } from "@betacall/svc-common";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { LoopService } from "./loop.service";

@Controller()
export class LoopController {

	constructor (
		private loopsvc: LoopService
	) {}

	@MessagePattern("call-loop:push")
  async push(@Payload() payload: { messages: Call[], provider: Call.Provider }) {
    await this.loopsvc.push(payload.provider, payload.messages);
		return 'Loop updated';
	}
}