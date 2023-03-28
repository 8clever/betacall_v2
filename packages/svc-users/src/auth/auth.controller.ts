import { User } from '@betacall/svc-common';
import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {

  constructor(
    private auth: AuthService
  ) {}

  @MessagePattern('auth:check')
  check (@Payload() payload: { jwt: string }) {
    return this.auth.validateToken(payload.jwt)
  }
	
  @UseGuards(AuthGuard('local'))
  @Post('/auth/login')
  async login(@Request() req: { user: User }) {
    return this.auth.generateToken(req.user)
  }
}