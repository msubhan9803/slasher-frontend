/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { SHARED_GATEWAY_OPTS, UNREAD_MESSAGE_NOTIFICATION_DELAY } from '../../constants';
import { UsersService } from '../../users/providers/users.service';
import { ChatService } from './chat.service';
import { Message } from '../../schemas/message/message.schema';
import { pick } from '../../utils/object-utils';
import { FriendsService } from '../../friends/providers/friends.service';
import { relativeToFullImagePath } from '../../utils/image-utils';

type MessageReturnType = Partial<{ success: boolean, message: Message, errorMessage: string }>;

@WebSocketGateway(SHARED_GATEWAY_OPTS)
export class ChatGateway {
  constructor(
    @InjectQueue('message-count-update') private messageCountUpdateQueue: Queue,
    private readonly usersService: UsersService,
    private readonly chatService: ChatService,
    private readonly friendsService: FriendsService,
    private readonly config: ConfigService,
  ) { }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('chatTest')
  async chatTest(@MessageBody() data: any): Promise<string> {
    return `chat message from ${data.senderId} to ${data.receiverId}: ${data.message}`;
  }

  @SubscribeMessage('chatMessage')
  async chatMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<MessageReturnType> {
    const inValidMessage = typeof data.message === 'undefined' || data.message === null || data.message === '';
    const inValidUserId = typeof data.toUserId === 'undefined' || data.toUserId === null;

    if (inValidMessage || inValidUserId) { return { success: false, message: null }; }

    const user = await this.usersService.findBySocketId(client.id);
    const fromUserId = user._id.toString();
    const { toUserId } = data;
    const areFriends = await this.friendsService.areFriends(user.id, toUserId);
    if (!areFriends) {
      return { success: false, errorMessage: 'You must be friends with this user to perform this action.' };
    }

    // TODO: Remove use of encodeURIComponent below once the old Slasher iOS/Android apps are retired
    // AND all old messages have been updated so that they're not being URI-encoded anymore.
    // The URI-encoding is coming from the old API or more likely the iOS and Android apps.
    // For some reason, the old apps will crash on a message page if the messages are not
    // url-encoded (we saw this while Damon was testing on Android).
    const urlEncodedMessage = encodeURIComponent(data.message);

    const messageObject = await this.chatService.sendPrivateDirectMessage(fromUserId, toUserId, urlEncodedMessage);
    const targetUserSocketIds = await this.usersService.findSocketIdsForUser(toUserId);
    targetUserSocketIds.forEach((socketId) => {
      client.to(socketId).emit('chatMessageReceived', {
        message: pick(messageObject, ['_id', 'image', 'message', 'fromId', 'matchId', 'createdAt']),
      });
      // TODO: Remove messageV2 and messageV3 lines below as soon as the old Android and iOS apps
      // are retired.  They're only here for temporary compatibility.
      client.to(socketId).emit('messageV2', messageObject);
      client.to(socketId).emit('messageV3', messageObject);
    });
    await this.messageCountUpdateQueue.add(
      'send-update-if-message-unread',
      { messageId: messageObject.id },
      { delay: UNREAD_MESSAGE_NOTIFICATION_DELAY }, // 15 second delay
    );
    const newMessageObject: any = {
      _id: messageObject._id,
      fromId: messageObject.fromId,
      message: messageObject.message,
      createdAt: messageObject.createdAt,
      image: messageObject.image,
      matchId: messageObject.matchId,
      created: messageObject.created,
      imageDescription: messageObject.imageDescription,
    };
    return { success: true, message: newMessageObject };
  }

  // TODO: Delete this.  No longer used.  And verify tests have been ported properly to new replacement route handler.
  @SubscribeMessage('getMessages')
  async getMessages(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<any> {
    const inValidData = typeof data.matchListId === 'undefined' || data.matchListId === null;
    if (inValidData) { return { success: false }; }

    const user = await this.usersService.findBySocketId(client.id);
    const userId = user._id.toString();

    const { matchListId, before } = data;

    const matchList = await this.chatService.findMatchList(matchListId, true);
    if (!matchList) { return { error: 'Permission denied' }; }

    const matchUserIds = matchList.participants.find(
      (participant) => (participant as any)._id.toString() === userId,
    );
    if (!matchUserIds) { return { error: 'Permission denied' }; }

    // If `before` param is undefined, mark all of this conversation's messages TO this user as read,
    // since the user is requesting the LATEST messages in the chat and will then be caught up.
    if (!before) {
      await this.chatService.markAllReceivedMessagesReadForChat(user.id, matchList.id);
      await this.emitConversationCountUpdateEvent(user.id);
    }

    const messages = await this.chatService.getMessages(matchListId, userId, 30, before);
    messages.forEach((messageObject) => {
      if (messageObject.image) {
        // eslint-disable-next-line no-param-reassign
        messageObject.image = relativeToFullImagePath(this.config, messageObject.image);
      }
    });
    return messages.map(
      (message) => pick(message, ['_id', 'message', 'isRead', 'imageDescription', 'createdAt', 'image', 'fromId', 'senderId']),
    );
  }

  @SubscribeMessage('messageRead')
  async markMessageAsRead(@MessageBody() data: any, @ConnectedSocket() client: Socket): Promise<any> {
    const inValidData = typeof data.messageId === 'undefined' || data.messageId === null;
    if (inValidData) { return { success: false }; }

    const user = await this.usersService.findBySocketId(client.id);
    const { messageId } = data;

    const message = await this.chatService.findByMessageId(messageId);
    if (!message) { return { error: 'Message not found' }; }

    // Reminder: mesage.senderId is who the message was sent TO
    if (message.senderId.toString() === user.id) {
      await this.chatService.markMessageAsRead(messageId);
      return { success: true };
    }
    return { success: false, error: 'Unauthorized' };
  }

  async emitConversationCountUpdateEvent(userId: string) {
    const targetUserSocketIds = await this.usersService.findSocketIdsForUser(userId);
    const user = await this.usersService.findById(userId, true);
    const unreadConversationCount = user.newConversationIds.length;
    targetUserSocketIds.forEach((socketId) => {
      this.server.to(socketId).emit('unreadConversationCountUpdate', { unreadConversationCount });
    });
  }

  async emitMessageForConversation(newMessagesArray, toUserId: string) {
    const targetUserSocketIds = await this.usersService.findSocketIdsForUser(toUserId);
    (newMessagesArray as any).forEach((messageObject) => {
      const cloneMessage = messageObject.toObject();
      cloneMessage.image = relativeToFullImagePath(this.config, cloneMessage.image);
      // Emit message to receiver
      targetUserSocketIds.forEach((socketId) => {
        this.server.to(socketId).emit('chatMessageReceived', {
          message: pick(cloneMessage, ['_id', 'image', 'message', 'fromId', 'matchId', 'createdAt']),
        });
      });
    });
  }

  @SubscribeMessage('clearNewConversationIds')
  async clearConverstionIds(@ConnectedSocket() client: Socket): Promise<any> {
    const user = await this.usersService.findBySocketId(client.id);
    if (!user) {
      // If the user severs the socket connection in the middle of message handling, then we will
      // not find a user associated with the socket id, and that also means that there's no one to
      // send a message back to.  So we can return an empty object.
      return {};
    }
    const userId = user._id.toString();
    const clearNewConversationIds = await this.usersService.clearConverstionIds(userId);
    return { newConversationIds: clearNewConversationIds.newConversationIds };
  }
}
