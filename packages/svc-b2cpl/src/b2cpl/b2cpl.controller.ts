import { ProviderController, Providers } from "@betacall/svc-common";
import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";

@Controller()
export class B2CPLController implements ProviderController {

	@MessagePattern(`${Providers.B2CPL}:getOrdersByIds`)
	getOrdersByIds(ids: string[]): object[] {
		throw new Error("Method not implemented.");
	}
	
}