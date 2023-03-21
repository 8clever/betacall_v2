import { Logger, UseGuards } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'net';
import { Server } from 'socket.io';
import { AuthGuard } from './gateaway.guard';

/**
 * TODO Complete work with sockets
 */

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CallerGateaway {
  @WebSocketServer()
  server: Server;

	users: Set<string>;

	@UseGuards(AuthGuard)
  @SubscribeMessage('events')
	handleEvent(client: Socket, data: string): string {
		Logger.log(client, data);
		return data;
	}
}