import { Call, User, createModule, runModule } from '@betacall/svc-common'
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
  },
  entities: [
    Call, User
  ]
});

runModule(AppModule, {
  swagger: {
    title: "Caller API",
    version: "1.0.0"
  },
  prefix: "api/v1/caller"
});