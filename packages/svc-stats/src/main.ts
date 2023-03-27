import { createModule, runModule } from "@betacall/svc-common"
import { StatsModule } from "./stats/stats.module";

const AppModule = createModule({
  metadata: {
    imports: [StatsModule]
  }
});

runModule(AppModule, {
  prefix: "api/v1/stats"
})