import { createModule, runModule } from "@betacall/svc-common"
import { ExportModule } from "./export/export.module"

const AppModule = createModule({
  metadata: {
    imports: [
      ExportModule
    ]
  }
})

runModule(AppModule, {
  prefix: "api/v1/export"
})