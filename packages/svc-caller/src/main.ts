import { createModule, runModule } from '@betacall/svc-common'
import { AsteriskModule } from './asterisk/asterisk.module';
import { CallerModule } from "./caller/caller.module"
import { LoopModule } from './loop/loop.module';

const AppModule = createModule({
  metadata: {
    imports: [
      CallerModule,
      LoopModule,
      AsteriskModule
    ]
  }
});

runModule(AppModule, {
  prefix: "api/v1/caller"
});