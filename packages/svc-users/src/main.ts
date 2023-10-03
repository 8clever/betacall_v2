/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { User, createModule, runModule } from "@betacall/svc-common";
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

const AppModule = createModule({
  metadata: {
    imports: [
      AuthModule,
      UsersModule
    ]
  },
  entities: [
    User
  ]
})

runModule(AppModule, { prefix: "api/v1/users" })
