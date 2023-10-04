import { AuthGuard, Call, Roles, User } from "@betacall/svc-common";
import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CallerService } from "./caller.service";
import { ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Caller")
@Controller()
export class CallerController {

  constructor (
    private callService: CallerService,
  ) {

  }

  @ApiResponse({
    type: Boolean
  })
  @Get('/ping')
  ping() {
    return true;
  }

  @ApiQuery({
    name: 'id'
  })
  @ApiQuery({
    name: "provider",
    enum: Call.Provider
  })
  @ApiResponse({
    type: Boolean
  })
  @Roles(User.Roles.OPERATOR)
  @UseGuards(AuthGuard)
  @Get('/assign-order')
  async assignOrder(@Req() req: { user: User }, @Query() query: { id: string, provider: Call.Provider }) {
    return this.callService.assignOrder({
      user: req.user,
      orderId: query.id,
      provider: query.provider
    });
  }

  @ApiResponse({
    schema: {
      type: "array",
      items: {
        properties: {
          order: {
            description: "Provider's orders",
            type: 'object'
          },
          provider: {
            enum: Object.values(Call.Provider)
          }
        }
      }
    }
  })
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