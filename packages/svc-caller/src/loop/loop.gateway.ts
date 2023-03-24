import { Call } from "@betacall/svc-common";
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "net";
import { LoopService } from "./loop.service";
import { getUserTopic } from "./user.topic";

interface Request {
  handshake: {
    query: {
      user: string;
			provider: Call.Provider
    }
  }
}

@WebSocketGateway({
	path: "/api/v1/caller/loop/socket",
	cors: {
		origin: "*"
	}
})
export class LoopGateway implements OnGatewayInit<Server> {

	@WebSocketServer()
  server: Server;

  constructor (
    private loopsvc: LoopService
  ) {

  }

  afterInit(server: Server) {
    this.loopsvc.server = server;
  }

  handleDisconnect(req: Request) {
    const { user, provider: providerName } = req.handshake.query
    if (!user) return;

    const provider = this.loopsvc.providers.get(providerName);
    if (!provider) return;

    provider.removeListener(user);
  }
  
  @SubscribeMessage("register")
  register(req: Request) {
    const { user, provider: providerName } = req.handshake.query
    if (!user) return;

    const provider = this.loopsvc.providers.get(providerName);
    if (!provider) return;

    provider.addListener(user);
    this.server.emit(getUserTopic(user, 'registered'));
  }
}