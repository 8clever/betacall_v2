import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard, Call, ProviderController, Roles, User } from "@betacall/svc-common"
import { Order } from "./td.types";
import { TopDeliveryService } from "./td.service";
import { MessagePattern, Payload } from "@nestjs/microservices";

@Controller()
export class TopDeliveryController implements ProviderController {

	constructor (
		private tdsvc: TopDeliveryService
	) {}

	@MessagePattern(`${Call.Provider.TOP_DELIVERY}:undercall`)
	async undercall(@Payload() id: string): Promise<null> {
		const order = this.tdsvc.orders.get(Number(id));
		if (!order) return null;

		await this.tdsvc.underCall(this.tdsvc.robot, { order });
		return null;
	}

	@MessagePattern(`${Call.Provider.TOP_DELIVERY}:getNextOrder`)
	getNextOrder(): Promise<Call> {
		return null;
	}

	@MessagePattern(`${Call.Provider.TOP_DELIVERY}:getNearDeliveryDatesIntervals`)
	getIntervals(@Payload() orderId: number) {
		return this.tdsvc.getNearDeliveryDatesIntervals({ orderId });
	}

	@MessagePattern(`${Call.Provider.TOP_DELIVERY}:getOrderByPhone`)
	getOrderByPhone(@Payload() phone: string) {
		const orderid = this.tdsvc.phones.get(phone);
		if (!orderid) return null;
		return this.tdsvc.orders.get(orderid) || null;
  }

	@MessagePattern(`${Call.Provider.TOP_DELIVERY}:getOrder`)
	getOrder (@Payload() orderId: string) {
		return this.tdsvc.orders.get(Number(orderId)) || null;
	}

	@MessagePattern(`${Call.Provider.TOP_DELIVERY}:orderDoneRobot`)
	doneRobot (@Payload() params: { orderId: number, callId: string, robotDeliveryDate: string }) {
		return this.tdsvc.doneRobot(params);
	}

	@MessagePattern(`${Call.Provider.TOP_DELIVERY}:orderRecallLater`)
	recallLater(@Payload() params: { orderId: number, callId: string }) {
		return this.tdsvc.replaceDateRobot(params);
	}

	@MessagePattern(`${Call.Provider.TOP_DELIVERY}:getOrdersByIds`)
	getOrdersByIds(@Payload() ids: string[] ) {
		return this.tdsvc.getOrdersByIds(ids);
	}

	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Get('/deny-reasons')
	getDenyReasons() {
		return this.tdsvc.denyReasons;
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
		return this.tdsvc.getNearDeliveryDatesIntervals({ orderId: Number(query.id) });
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
