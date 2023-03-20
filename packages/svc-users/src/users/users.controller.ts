import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { UsersService } from './users.service';

@Controller()
export class UsersController {

  constructor(
    private readonly userService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  me(@Req() req) {
    return req.user;
  }
}
