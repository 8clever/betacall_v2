import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Socket } from 'net';
import { Server } from 'socket.io';

interface Request {
  handshake: {
    query: {
      user: string;
    }
  }
}

@WebSocketGateway({
  path: "/api/v1/caller/socket",
  cors: {
    origin: '*',
  },
})
export class CallerGateaway implements OnGatewayConnection<Request>, OnGatewayDisconnect<Request> {

  @WebSocketServer()
  server: Server;

	users = new Set<string>();
  
  handleDisconnect(req: Request) {
    const { user } = req.handshake.query
    if (user) {
      this.users.delete(user)
    }
  }
  
  handleConnection(req: Request) {
    const { user } = req.handshake.query
    if (user) {
      this.users.add(user)
    }
  }
}