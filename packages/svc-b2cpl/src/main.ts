import { createModule, runModule } from "@betacall/svc-common";

const AppModule = createModule({
  metadata: {
    imports: []
  }
});

runModule(AppModule, {
  prefix: "api/v1/b2cpl"
})
