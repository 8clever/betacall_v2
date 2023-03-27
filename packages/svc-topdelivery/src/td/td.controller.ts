import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard, Call, Roles, User } from "@betacall/svc-common"
import { Order } from "./td.types";
import { TopDeliveryService } from "./td.service";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller()
export class TopDeliveryController {

	constructor (
		private tdsvc: TopDeliveryService
	) {}

	@MessagePattern(`${Call.Provider.TOP_DELIVERY}:getOrdersByIds`)
	getOrdersByID(@Payload() ids: string[] ) {
		return this.tdsvc.getOrdersByIds(ids);
	}

	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Get('/history')
	getHistory(@Query() query: { orderId: string }) {
		return this.tdsvc.getHistoryByOrderId({ orderId: query.orderId });
	}

	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Get('/pickup-points')
	getPickupPoints(@Query() query: { partnerId: string }) {
		return this.tdsvc.pickupPoints.get(query.partnerId) || [];
	}

	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Get('/near-delivery-dates-intervals')
	getNearDeliveryDatesIntervals (@Query() query: { id: string }) {
		return this.tdsvc.getNearDeliveryDatesIntervals({ orderId: query.id });
	}

	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Post('/done-order-pickup')
	doneOrderPickup(@Req() req: { user: User }, @Body() body: { order: Order, pickupId: number } ) {
		return this.tdsvc.doneOrderPickup(req.user, body);
	}

	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Post('/done-order')
	doneOrder(@Req() req: { user: User }, @Body() body: { order: Order } ) {
		return this.tdsvc.doneOrder(req.user, body);
	}

	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Post('/deny-order')
	denyOrder(@Req() req: { user: User }, @Body() body: { order: Order } ) {
		return this.tdsvc.denyOrder(req.user, body);
	}

	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Post('/undercall-order')
	underCall(@Req() req: { user: User }, @Body() body: { order: Order } ) {
		return this.tdsvc.underCall(req.user, body);
	}

	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Post('/replacedate-order')
	replaceCall(@Req() req: { user: User }, @Body() body: { order: Order, replaceDate: string } ) {
		return this.tdsvc.replaceCallDate(req.user, body);
	}
}
