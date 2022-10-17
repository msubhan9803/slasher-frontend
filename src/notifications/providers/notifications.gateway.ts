/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any, ...args: any[]) {
    console.log('client connected (notifications)');
  }

  handleDisconnect(client: any) {
    console.log('client disconnected (notifications)');
  }

  @SubscribeMessage('getNotifications')
  async sendReceiveMessage(@MessageBody() data: any): Promise<string> {
    return `getNotifications response.  received: ${data.message}`;
  }
}
