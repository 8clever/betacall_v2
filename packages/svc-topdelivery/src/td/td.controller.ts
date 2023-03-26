import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard, Roles, User } from "@betacall/svc-common"
import { Order } from "./td.types";
import { TopDeliveryService } from "./td.service";

@Controller()
export class TopDeliveryController {

	constructor (
		private tdsvc: TopDeliveryService
	) {}

	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Post('done-order-pickup')
	doneOrderPickup(@Req() req: { user: User }, @Body() body: { order: Order, pickupId: number } ) {
		return this.tdsvc.doneOrderPickup(req.user, body);
	}

	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Post('done-order')
	doneOrder(@Req() req: { user: User }, @Body() body: { order: Order } ) {
		return this.tdsvc.doneOrder(req.user, body);
	}

	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Post('deny-order')
	denyOrder(@Req() req: { user: User }, @Body() body: { order: Order } ) {
		return this.tdsvc.denyOrder(req.user, body);
	}

	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Post('undercall-order')
	underCall(@Req() req: { user: User }, @Body() body: { order: Order } ) {
		return this.tdsvc.underCall(req.user, body);
	}

	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Post('replacedate-order')
	replaceCall(@Req() req: { user: User }, @Body() body: { order: Order, replaceDate: string } ) {
		return this.tdsvc.replaceCallDate(req.user, body);
	}
}
