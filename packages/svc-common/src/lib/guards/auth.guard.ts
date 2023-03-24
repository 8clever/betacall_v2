import { CanActivate, ExecutionContext, Inject, Req } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { MQTT_TOKEN } from "../mqtt";
import { getToken } from "../getToken"
import { promiseObservable } from "../promiseObservable";
import { User } from "../entities/user.entity";
import { Reflector } from "@nestjs/core";

export class AuthGuard implements CanActivate {
  constructor(
    @Inject(MQTT_TOKEN)
    private readonly client: ClientProxy,
    private reflector: Reflector
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
		const jwt = getToken(req.headers || req.handshake.headers);
		const sendResponse = this.client.send("auth:check", { jwt })
		const response: User & { error?: string } = await promiseObservable<{ error: string } & User>(sendResponse);
    if (response.error)
      return false;

    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    req.user = response;

    if (roles?.length)
      return roles.includes(response.role)

    return true;
  }
}