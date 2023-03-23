import { CanActivate, ExecutionContext, Inject, Req } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { MQTT_TOKEN } from "../mqtt";
import { getToken } from "../getToken"
import { promiseObservable } from "../promiseObservable";
import { User } from "../entities/user.entity";

export class AuthGuard implements CanActivate {
  constructor(
    @Inject(MQTT_TOKEN)
    private readonly client: ClientProxy
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
		const jwt = getToken(req.headers || req.handshake.headers);
    console.log(jwt)
		const sendResponse = this.client.send("auth:check", { jwt })
		const response = await promiseObservable<{ error: string } & User>(sendResponse);
    if (response.error)
      return false;

    req.user = response;
    return true;
  }
}