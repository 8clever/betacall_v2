import { Call, Provider } from "@betacall/svc-common";
import { Body, Controller, Delete, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import {  ApiBody, ApiHeader, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { API_KEY_HEADER, ApiKeyGuard } from "./external.guard";
import { LoopService } from "../loop/loop.service";

@ApiTags("External")
@Controller('/external')
export class ExternalController {

  constructor (
    private loopsvc: LoopService,
  ) {

  }

  @ApiHeader({
    name: API_KEY_HEADER
  })
  @ApiBody({
    description: "Update call queue pool",
    isArray: true,
    type: Call
  })
  @ApiResponse({
    schema: {
      properties: {
        message: {
          type: "string"
        }
      }
    }
  })
  @Post('/pool')
  @UseGuards(ApiKeyGuard)
  async updatePool (@Body() body: Call[], @Req() req: { provider: Provider }) {
    await this.loopsvc.push(req.provider.name, body);
    return { message: "Pool updated successfully" }
  }

  @ApiHeader({
    name: API_KEY_HEADER
  })
  @ApiBody({
    description: "Push call to system queue",
    type: Call
  })
  @ApiResponse({
    schema: {
      properties: {
        message: {
          type: "string"
        }
      }
    }
  })
  @Post('/push')
  @UseGuards(ApiKeyGuard)
  pushOrder (@Body() body: Call, @Req() req: { provider: Provider }) {
    return this.loopsvc.pushOne(req.provider.key, body);
  }

  @ApiHeader({
    name: API_KEY_HEADER
  })
  @ApiResponse({
    schema: {
      properties: {
        message: {
          type: "string"
        }
      }
    }
  })
  @Delete('/delete/:orderId')
  @UseGuards(ApiKeyGuard)
  removeOrder (@Param("orderId") orderid: string, @Req() req: { provider: Provider }) {
    return this.loopsvc.removeOne(req.provider.key, orderid);
  }
}