/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io-client';
import { Server } from 'socket.io';
import { UsersService } from '../../users/providers/users.service';
import { SHARED_GATEWAY_OPTS } from '../../constants';
import { FriendsService } from './friends.service';

@WebSocketGateway(SHARED_GATEWAY_OPTS)
export class FriendsGateway {
  constructor(
    private readonly usersService: UsersService,
    private readonly friendsService: FriendsService,
  ) { }

  @WebSocketServer()
  server: Server;

  async emitFriendRequestReceivedEvent(userId: string, actionUserId?: string) {
    const targetUserSocketIds = await this.usersService.findSocketIdsForUser(userId);
    const [pendingFriendRequestCount, receivedFriendRequestsData] = await Promise.all([
      this.friendsService.getReceivedFriendRequestCount(userId),
      await this.friendsService.getReceivedFriendRequests(userId, 3),
    ]);

    targetUserSocketIds.forEach((socketId) => {
      this.server.to(socketId).emit('friendRequestReceived', {
        pendingFriendRequestCount,
        recentFriendRequests: receivedFriendRequestsData,
        actionUserId,
      });
    });
  }
}
