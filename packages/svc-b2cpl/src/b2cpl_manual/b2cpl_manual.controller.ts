import { AuthGuard, ProviderController, Providers, Roles, User } from "@betacall/svc-common";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { B2CPLManualService } from "./b2cpl_manual.service";
import { DeliveryDayNearestParams } from "./b2cpl_manual.types";

@Controller('/manual')
export class B2CPLManualController implements ProviderController {

	constructor(
		private b2cplManualSvc: B2CPLManualService
	) {}
	
	@Roles(User.Roles.OPERATOR)
	@UseGuards(AuthGuard)
	@Post('/delivery-day-nearest')
	deliveryDayNearest(@Body() body: DeliveryDayNearestParams) {
		return this.b2cplManualSvc.getDeliveryDayNearest(body);
	}

	@MessagePattern(`${Providers.B2CPL_MANUAL}:getNextOrder`)
	getNextOrder(): object {
		return this.b2cplManualSvc.getNextOrder();
	}

	@MessagePattern(`${Providers.B2CPL_MANUAL}:getOrdersByIds`)
	getOrdersByIds(@Payload() ids: string[]): object[] {
		return this.b2cplManualSvc.getOrdersByIds(ids);
	}
	
}