import { createModule, runModule } from "@betacall/svc-common";
import { SipModule } from "./sip/sip.module";

const AppModule = createModule({
  metadata: {
    imports: [
      SipModule
    ]
  }
})

runModule(AppModule, {
  prefix: "aip/v1/sip"
})