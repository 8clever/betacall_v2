import { Provider, createModule, runModule } from "@betacall/svc-common"
import { ProviderModule } from "./provider/provider.module"

const AppModule = createModule({
  metadata: {
    imports: [
      ProviderModule
    ]
  },
  entities: [
    Provider
  ]
})

runModule(AppModule, {
  prefix: "api/v1/provider"
})