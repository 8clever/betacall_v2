import { AuthGuard, Call, Roles, User } from "@betacall/svc-common";
import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { LoopService } from "./loop.service";

@Controller()
export class LoopController {

	constructor (
		private loopsvc: LoopService
	) {}

	@Roles(User.Roles.OPERATOR)
  @UseGuards(AuthGuard)
  @Get('/assign-next-order')
  async assignNextOrder(@Req() req: { user: User }, @Query() query: { provider: Call.Provider }) {
    const result = await this.loopsvc.assignNextOrder(req.user, query.provider);
		return { result };
	}

	@MessagePattern("call-loop:listeners")
	getListeners(@Payload() provider: Call.Provider) {
		return this.loopsvc.providers.get(provider)?.getListeners() || []
	}

	@MessagePattern("call-loop:push")
  async push(@Payload() payload: { messages: Call[], provider: Call.Provider }) {
    await this.loopsvc.push(payload.provider, payload.messages);
		return 'Loop updated';
	}
}