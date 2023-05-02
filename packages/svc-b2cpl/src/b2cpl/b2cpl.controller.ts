import { Call, ProviderController } from "@betacall/svc-common";
import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";

@Controller()
export class B2CPLController implements ProviderController {
	undercall(id: string): Promise<null> {
		throw new Error("Method not implemented.");
	}

	@MessagePattern(`${Call.Provider.B2CPL}:getNextOrder`)
	getNextOrder(): object {
		return null;
	}

	@MessagePattern(`${Call.Provider.B2CPL}:getOrdersByIds`)
	getOrdersByIds(ids: string[]): object[] {
		throw new Error("Method not implemented.");
	}
	
}