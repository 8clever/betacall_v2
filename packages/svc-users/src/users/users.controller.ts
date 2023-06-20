import { User } from '@betacall/svc-common';
import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { UsersService } from './users.service';

const isAdmin = (user: User) => {
  if (user.role === User.Roles.ADMIN) return;
  throw new BadRequestException();
}

@Controller()
export class UsersController {

  constructor(
    private readonly usersvc: UsersService
  ) {}

  @MessagePattern("users:find")
  find(@Payload() user: Partial<User>) {
    return this.usersvc.findOne(user);
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
  @Delete("/:id")
  deleteUser (@Param() params: { id: string }, @Req() req: { user: User }) {
    isAdmin(req.user);
    return this.usersvc.remove(params.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getUsers (@Req() req: { user: User }, @Query() query: Partial<User> & { skip?: string, limit?: string }) {
    isAdmin(req.user);
    const { skip, limit, ...where } = query;
    const options: { skip?: number, limit?: number } = {};
    if (skip) options.skip = Number(skip);
    if (limit) options.limit = Number(limit);
    return this.usersvc.findMany(where, options);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/edit')
  edit(@Req() req: { user: User }, @Body() user: User) {
    isAdmin(req.user);
    return this.usersvc.save(user);
  }
}
