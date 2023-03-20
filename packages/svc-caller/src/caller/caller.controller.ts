import { Call } from "@betacall/svc-common";
import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CallerService } from "./caller.service";

@Controller()
export class CallerController {

  constructor (
    private callService: CallerService
  ) {

  }

  @MessagePattern("caller:save")
  saveCall(@Payload() payload: Partial<Call>) {
    return this.callService.save(payload);
  }
}