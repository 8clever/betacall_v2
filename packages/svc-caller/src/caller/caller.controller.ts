import { AuthGuard, Call, Roles, User } from "@betacall/svc-common";
import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CallerService } from "./caller.service";

@Controller()
export class CallerController {

  constructor (
    private callService: CallerService,
  ) {

  }

  @Get('/ping')
  ping() {
    return true;
  }

  @Roles(User.Roles.OPERATOR)
  @UseGuards(AuthGuard)
  @Get('/assign-order')
  assignOrder(@Req() req: { user: User }, @Query() query: { id: string, provider: Call.Provider }) {
    return this.callService.add({
      orderId: query.id,
      user: req.user,
      phone: "",
      provider: query.provider,
      status: Call.Status.OPERATOR,
      region: ""
    })
  }

  @Roles(User.Roles.OPERATOR)
  @UseGuards(AuthGuard)
  @Get('/my-orders')
  async getMyOrders (@Req() req: { user: User }) {
    return this.callService.getOperatorOrders(req.user);
  }

  @MessagePattern("call:add")
  addCall(@Payload() payload: Partial<Call>) {
    return this.callService.add(payload);
  }

  @MessagePattern("call:save")
  saveCall(@Payload() payload: Partial<Call>) {
    return this.callService.save(payload);
  }
}