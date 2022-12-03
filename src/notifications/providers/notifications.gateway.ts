/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SHARED_GATEWAY_OPTS } from '../../constants';

@WebSocketGateway(SHARED_GATEWAY_OPTS)
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('getNotifications')
  async sendReceiveMessage(@MessageBody() data: any): Promise<string> {
    return `getNotifications response.  received: ${data.message}`;
  }
}
