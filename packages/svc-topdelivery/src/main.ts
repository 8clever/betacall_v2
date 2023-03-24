import { createModule, runModule } from '@betacall/svc-common';
import { TopDeliveryModule } from './td/td.module';

const AppModule = createModule({
  metadata: {
    imports: [TopDeliveryModule]
  }
});

runModule(AppModule, {
  prefix: "api/v1/topdelivery",
})