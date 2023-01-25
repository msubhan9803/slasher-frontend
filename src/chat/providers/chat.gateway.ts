/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SHARED_GATEWAY_OPTS } from '../../constants';
import { UsersService } from '../../users/providers/users.service';
import { ChatService } from './chat.service';
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

  @SubscribeMessage('getMessages')
  async getMessages(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<any> {
    const inValidData = typeof data.matchListId === 'undefined' || data.matchListId === null;
    if (inValidData) return { success: false };

    const user = await this.usersService.findBySocketId(client.id);
    const userId = user._id.toString();

    const { matchListId, before } = data;

    const matchList = await this.chatService.findMatchList(matchListId);
    if (!matchList) return { error: 'Permission denied' };

    const matchUserIds = matchList.participants.find(
      (participant) => (participant as any)._id.toString() === userId,
    );
    if (!matchUserIds) return { error: 'Permission denied' };

    // If `before` param is undefined, mark all of this conversation's messages TO this user as read,
    // since the user is requesting the LATEST messages in the chat and will then be caught up.
    if (!before) {
      await this.chatService.markAllReceivedMessagesReadForChat(user.id, matchList.id);
    }

    const messages = await this.chatService.getMessages(matchListId, userId, RECENT_MESSAGES_LIMIT, before);

    return messages;
  }
}
