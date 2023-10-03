import { Controller } from "@nestjs/common";
import { ProviderService } from "./provider.service";

@Controller()
export class ProviderController {

	constructor(
		private providersvc: ProviderService
	) {}
}