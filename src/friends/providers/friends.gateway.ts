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
import { Friend } from '../../schemas/friend/friend.schema';
import { pick } from '../../utils/object-utils';

@WebSocketGateway(SHARED_GATEWAY_OPTS)
export class FriendsGateway {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('clearNewFriendRequestCount')
  async clearNewFriendRequestCount(@ConnectedSocket() client: Socket): Promise<any> {
    const user = await this.usersService.findBySocketId(client.id);
    const userId = user._id.toString();
    const clearFriendRequestCount = await this.usersService.clearFriendRequestCount(userId);
    const targetUserSocketIds = await this.usersService.findSocketIdsForUser(userId);
    return targetUserSocketIds.forEach((socketId) => {
      this.server.to(socketId).emit('clearNewFriendRequestCount', {
        newFriendRequestCount: clearFriendRequestCount.newFriendRequestCount,
      });
    });
  }

  async emitFriendRequestReceivedEvent(friend: Friend) {
    const targetUserSocketIds = await this.usersService.findSocketIdsForUser(friend.to.toString());
    targetUserSocketIds.forEach((socketId) => {
      this.server.to(socketId).emit('friendRequestReceived', {
        friend: pick(friend, ['_id', 'from', 'to', 'reaction']),
      });
    });
  }
}
