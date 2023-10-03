import { Stats, User, createModule, runModule } from "@betacall/svc-common"
import { StatsModule } from "./stats/stats.module";

const AppModule = createModule({
  metadata: {
    imports: [StatsModule]
  },
  entities: [
    Stats, User
  ]
});

runModule(AppModule, {
  prefix: "api/v1/stats"
})