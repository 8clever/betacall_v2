import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {

  constructor(
    private auth: AuthService,
    private user: UsersService
  ) {}

  @MessagePattern('auth:check')
  check (@Payload() payload: { jwt: string }) {
    return this.auth.validateToken(payload.jwt)
  }
	
  @UseGuards(AuthGuard('local'))
  @Post('/auth/login')
  async login(@Request() req) {
    return this.auth.generateToken(req.user)
  }

  @Post('/auth/signup')
  async signup(@Body() user) {
    return this.user.signup(user)
  }
}