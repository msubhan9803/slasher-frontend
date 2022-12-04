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
import { Server, Socket } from 'socket.io';
import { SHARED_GATEWAY_OPTS } from '../../constants';
import { UsersService } from '../../users/providers/users.service';
import { ChatService } from './chat.service';
import { sleep } from '../../utils/timer-utils';
import { Message } from '../../schemas/message/message.schema';

const RECENT_MESSAGES_LIMIT = 10;

@WebSocketGateway(SHARED_GATEWAY_OPTS)
export class ChatGateway {
  constructor(private readonly usersService: UsersService, private readonly chatService: ChatService) { }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('chatTest')
  async chatTest(@MessageBody() data: any): Promise<string> {
    return `chat message from ${data.senderId} to ${data.receiverId}: ${data.message}`;
  }

  @SubscribeMessage('chatMessage')
  async chatMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<{ success: boolean, message: Message }> {
    const inValidMessage = typeof data.message === 'undefined' || data.message === null || data.message === '';
    const inValidUserId = typeof data.toUserId === 'undefined' || data.toUserId === null;

    if (inValidMessage || inValidUserId) return { success: false, message: null };

    const user = await this.usersService.findBySocketId(client.id);
    const fromUserId = user._id.toString();
    const { toUserId } = data;
    const messageObject = await this.chatService.sendPrivateDirectMessage(fromUserId, toUserId, data.message);
    const targetUserSocketIds = await this.usersService.findSocketIdsForUser(toUserId);
    targetUserSocketIds.forEach((socketId) => {
      client.to(socketId).emit('chatMessageReceived', { message: messageObject.message, user });
    });
    return { success: true, message: messageObject };
  }

  @SubscribeMessage('recentMessages')
  async recentMessages(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<any> {
    const inValidData = typeof data.matchListId === 'undefined' || data.matchListId === null;

    if (inValidData) return { success: false };

    const user = await this.usersService.findBySocketId(client.id);
    const userId = user._id.toString();

    const { matchListId, before } = data;

    const messages = await this.chatService.getMessages(matchListId, userId, RECENT_MESSAGES_LIMIT, before);
    return messages;
  }
}
