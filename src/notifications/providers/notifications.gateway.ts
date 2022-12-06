/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UsersService } from '../../users/providers/users.service';
import { SHARED_GATEWAY_OPTS } from '../../constants';
import { Notification } from '../../schemas/notification/notification.schema';

@WebSocketGateway(SHARED_GATEWAY_OPTS)
export class NotificationsGateway {
  constructor(private readonly usersService: UsersService) { }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('getNotifications')
  async sendReceiveMessage(@MessageBody() data: any): Promise<string> {
    return `getNotifications response.  received: ${data.message}`;
  }

  async emitMessageForNotification(notification: Notification) {
    const targetUserSocketIds = await this.usersService.findSocketIdsForUser(notification.userId.toString());
    targetUserSocketIds.forEach((socketId) => {
      this.server.to(socketId).emit('notificationReceived', { notification });
    });
  }
}
