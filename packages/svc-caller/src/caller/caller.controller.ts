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

  @MessagePattern("caller:push")
  push(@Payload() payload: { messages: Call[] }) {
    return this.callService.push(payload.messages);
  }

  @MessagePattern("caller:save")
  saveCall(@Payload() payload: Partial<Call>) {
    return this.callService.save(payload);
  }
}