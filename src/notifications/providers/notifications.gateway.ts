/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io-client';
import { ConfigService } from '@nestjs/config';
import { Server } from 'socket.io';
import { RssFeedProvider } from 'src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { UsersService } from '../../users/providers/users.service';
import { SHARED_GATEWAY_OPTS } from '../../constants';
import { Notification } from '../../schemas/notification/notification.schema';
import { relativeToFullImagePath } from '../../utils/image-utils';
import { User } from '../../schemas/user/user.schema';
import { pick } from '../../utils/object-utils';

@WebSocketGateway(SHARED_GATEWAY_OPTS)
export class NotificationsGateway {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: ConfigService,

  ) { }

  @WebSocketServer()
  server: Server;

  async emitMessageForNotification(notification: Notification) {
    const targetUserSocketIds = await this.usersService.findSocketIdsForUser(notification.userId.toString());
    if (notification.senderId) {
      // eslint-disable-next-line no-param-reassign
      (notification.senderId as unknown as User).profilePic = relativeToFullImagePath(
        this.config,
        (notification.senderId as unknown as User).profilePic,
      );
    }
    // eslint-disable-next-line no-param-reassign
    if (notification.rssFeedProviderId) {
      // eslint-disable-next-line no-param-reassign
      (notification.rssFeedProviderId as unknown as RssFeedProvider).logo = relativeToFullImagePath(
        this.config,
        (notification.rssFeedProviderId as unknown as RssFeedProvider).logo,
      );
    }
    targetUserSocketIds.forEach((socketId) => {
      this.server.to(socketId).emit('notificationReceived', {
        notification: pick(notification, [
          '_id', 'createdAt', 'feedCommentId', 'feedPostId', 'feedReplyId', 'isRead',
          'notificationMsg', 'notifyType', 'rssFeedProviderId', 'senderId', 'userId',
        ]),
      });
    });
  }

  @SubscribeMessage('clearNewNotificationCount')
  async clearNewNotificationCount(@ConnectedSocket() client: Socket): Promise<any> {
    const user = await this.usersService.findBySocketId(client.id);
    const userId = user._id.toString();
    const clearNotificationCount = await this.usersService.clearNotificationCount(userId);
    const targetUserSocketIds = await this.usersService.findSocketIdsForUser(userId);
    targetUserSocketIds.forEach((socketId) => {
      this.server.to(socketId).emit('clearNewNotificationCount', { newNotificationCount: clearNotificationCount.newNotificationCount });
    });
    return { newNotificationCount: clearNotificationCount.newNotificationCount };
  }
}
