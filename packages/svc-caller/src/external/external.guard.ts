import { CanActivate, ExecutionContext, Inject } from "@nestjs/common";
import { CustomMqtt, MQTT_TOKEN } from "@betacall/svc-common";

export const API_KEY_HEADER = "X-BETACALL-API-KEY"

export class ApiKeyGuard implements CanActivate {
  constructor(
    @Inject(MQTT_TOKEN)
    private readonly client: CustomMqtt
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
		const apiKey = req.headers[API_KEY_HEADER.toLowerCase()];
		const provider = await this.client.paranoid('provider:apikey', apiKey);
		
		if (provider) {
			req.provider = provider;
			return true;
		}

		return false;
  }
}