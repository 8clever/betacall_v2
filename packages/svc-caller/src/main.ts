import { createModule, runModule } from '@betacall/svc-common'
import { CallerModule } from "./caller/caller.module"

const AppModule = createModule({
  metadata: {
    imports: [CallerModule]
  }
});

runModule(AppModule, {
  prefix: "api/v1/caller"
});