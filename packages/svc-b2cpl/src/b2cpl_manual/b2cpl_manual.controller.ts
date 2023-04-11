import { ProviderController, Providers } from "@betacall/svc-common";
import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { B2CPLManualService } from "./b2cpl_manual.service";

@Controller()
export class B2CPLManualController implements ProviderController {

	constructor(
		private b2cplManualSvc: B2CPLManualService
	) {}

	@MessagePattern(`${Providers.B2CPL_MANUAL}:getOrdersByIds`)
	getOrdersByIds(ids: string[]): object[] {
		return this.b2cplManualSvc.getOrdersByIds(ids);
	}
	
}