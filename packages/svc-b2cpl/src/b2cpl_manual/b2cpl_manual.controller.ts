import { ProviderController, Providers } from "@betacall/svc-common";
import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";

@Controller()
export class B2CPLManualController implements ProviderController {

	@MessagePattern(`${Providers.B2CPL_MANUAL}:getOrdersByIds`)
	getOrdersByIds(ids: string[]): object[] {
		throw new Error("Method not implemented.");
	}
	
}