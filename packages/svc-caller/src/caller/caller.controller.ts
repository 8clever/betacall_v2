import { Call } from "@betacall/svc-common";
import { Controller, Get } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CallerService } from "./caller.service";

@Controller()
export class CallerController {

  constructor (
    private callService: CallerService
  ) {

  }

  @Get('/ping')
  ping() {
    return true;
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