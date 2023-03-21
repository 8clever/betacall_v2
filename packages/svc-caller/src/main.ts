import { createModule, runModule } from '@betacall/svc-common'
import { AsteriskModule } from './asterisk/asterisk.module';
import { CallerModule } from "./caller/caller.module"

const AppModule = createModule({
  metadata: {
    imports: [
      CallerModule,
      AsteriskModule
    ]
  }
});

runModule(AppModule, {
  prefix: "api/v1/caller"
});