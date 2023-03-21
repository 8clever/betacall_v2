import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'net';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CallerGateaway {
  @WebSocketServer()
  server: Server;

	users: Set<string>;

  @SubscribeMessage('events')
	handleEvent(client: Socket, data: string): string {
		Logger.log(client, data);
		return data;
	}
}