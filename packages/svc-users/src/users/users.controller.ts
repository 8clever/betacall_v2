import { User } from '@betacall/svc-common';
import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { UsersService } from './users.service';

@Controller()
export class UsersController {

  constructor(
    private readonly usersvc: UsersService
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

  @UseGuards(JwtAuthGuard)
  @Post('/edit')
  edit(@Req() req: { user: User }, @Body() user: User) {
    if (req.user.role !== User.Roles.ADMIN)
      throw new BadRequestException();

    return this.usersvc.save(user);
  }
}
