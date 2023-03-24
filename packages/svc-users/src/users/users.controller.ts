import { User } from '@betacall/svc-common';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { UsersService } from './users.service';

@Controller()
export class UsersController {

  constructor(
    private readonly usersvc: UsersService,
    private readonly tokensvc: 
  ) {}

  @MessagePattern("users:find")
  find(@Payload() user: Partial<User>) {
    return this.find(user);
  }

  @MessagePattern('users:robot')
  getRobot() {
    return this.usersvc.findOne({ login: UsersService.ROBOT_NAME });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  getMe(@Req() req: { user: User }) {
    return req.user;
  }
}
