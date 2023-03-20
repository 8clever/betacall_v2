import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { UsersService } from './users.service';

@Controller()
export class UsersController {

  constructor(
    private readonly userService: UsersService,
  ) {}

  @MessagePattern('users:robot')
  getRobot() {
    return this.userService.findOne({ login: UsersService.ROBOT_NAME });
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  me(@Req() req) {
    return req.user;
  }
}
