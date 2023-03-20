import { createModule, runModule } from '@betacall/svc-common'

const AppModule = createModule({
  metadata: {}
});

runModule(AppModule, {
  prefix: "api/v1/caller"
});