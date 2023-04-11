import { createModule, runModule } from "@betacall/svc-common";
import { B2CPLModule } from "./b2cpl/b2cpl.module";
import { B2CPLManualModule } from "./b2cpl_manual/b2cpl_manual.module";

const AppModule = createModule({
  metadata: {
    imports: [
      B2CPLModule,
      B2CPLManualModule
    ]
  }
});

runModule(AppModule, {
  prefix: "api/v1/b2cpl"
})
