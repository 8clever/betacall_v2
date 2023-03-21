import { createModule, runModule } from '@betacall/svc-common';

const AppModule = createModule({
  metadata: {},
  db: false
});

runModule(AppModule, {
  prefix: "api/v1/topdelivery",
})