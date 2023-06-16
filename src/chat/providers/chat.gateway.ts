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
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { SHARED_GATEWAY_OPTS, UNREAD_MESSAGE_NOTIFICATION_DELAY } from '../../constants';
import { UsersService } from '../../users/providers/users.service';
import { ChatService } from './chat.service';
import { Message, MessageDocument } from '../../schemas/message/message.schema';
import { pick } from '../../utils/object-utils';
import { FriendsService } from '../../friends/providers/friends.service';
import { relativeToFullImagePath } from '../../utils/image-utils';

@WebSocketGateway(SHARED_GATEWAY_OPTS)
export class ChatGateway {
  constructor(
    @InjectQueue('message-count-update') private messageCountUpdateQueue: Queue,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
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
  async chatMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
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

    // Convert messageObject image and urls to full paths before sending to the user
    if (messageObject.image) {
      messageObject.image = relativeToFullImagePath(this.config, messageObject.image);
    }
    messageObject.urls = messageObject.urls.map((url) => relativeToFullImagePath(this.config, url));

    // TODO: Remove messageObjectReformattedForOldApi as soon as the old Android and iOS apps
    // are retired.  These lines are only here for temporary compatibility.
    const messageObjectReformattedForOldApi = {
      ...messageObject.toObject(),
      fromUser: {
        _id: user.id,
        userName: user.userName,
        profilePic: user.profilePic,
        matchId: messageObject.matchId,
      },
    };

    const unreadMsgCount = await this.getUnreadMessageCount(messageObject.fromId.toString(), messageObject.matchId.toString());
    Object.assign(messageObject, {
      unreadMsgCount,
      fromUser: {
        _id: user.id,
        userName: user.userName,
        profilePic: relativeToFullImagePath(this.config, user.profilePic),
      },
    });

    targetUserSocketIds.forEach((socketId) => {
      client.to(socketId).emit('chatMessageReceived', {
        message: pick(messageObject, ['_id', 'image', 'urls', 'message', 'fromId', 'matchId', 'createdAt', 'unreadMsgCount', 'fromUser']),
      });
      // TODO: Remove messageV2, and messageV3 lines below as soon as the old Android and iOS apps
      // are retired.  These lines are only here for temporary compatibility.
      client.to(socketId).emit('messageV2', messageObjectReformattedForOldApi);
      client.to(socketId).emit('messageV3', messageObjectReformattedForOldApi);
    });
    await this.messageCountUpdateQueue.add(
      'send-update-if-message-unread',
      { messageId: messageObject.id },
      { delay: UNREAD_MESSAGE_NOTIFICATION_DELAY }, // 15 second delay
    );

    return {
      success: true,
      message: pick(messageObject, [
        '_id', 'fromId', 'message', 'createdAt', 'image', 'urls', 'matchId', 'imageDescription',
        // NOTE: created is not actually used by the website, but it may be significant
        // in the old iOS and android apps, so we're returning it here just so we can
        // make sure that one of our e2e tests verifies the value.
        // TODO: Remove this from the socket event response once the old iOS and Android apps are retired.
        'created',
      ]),
    };
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
      if (messageObject.urls.length > 0) {
        // eslint-disable-next-line no-param-reassign
        messageObject.urls = messageObject.urls.map((url) => relativeToFullImagePath(this.config, url));
      }
    });
    return messages.map(
      (message) => pick(message, ['_id', 'message', 'isRead', 'imageDescription', 'createdAt', 'image', 'urls', 'fromId', 'senderId']),
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
    for (const messageObject of newMessagesArray as any) {
      const cloneMessage = messageObject.toObject();
      cloneMessage.image = relativeToFullImagePath(this.config, cloneMessage.image);
      cloneMessage.urls = cloneMessage.urls.map((url) => relativeToFullImagePath(this.config, url));

      // TODO: Remove fromUser and messageObjectReformattedForOldApi as soon as the old Android and
      // iOS apps are retired.  These lines are only here for temporary compatibility.
      const fromUser = await this.usersService.findById(cloneMessage.fromId, false);
      // NOTE: We are NOT transforming the image and urls fields to full https URLs because the
      // iOS and Android apps expect relative URLs.
      const messageObjectReformattedForOldApi = {
        ...messageObject.toObject(),
        fromUser: {
          _id: fromUser.id,
          userName: fromUser.userName,
          profilePic: fromUser.profilePic,
          matchId: messageObject.matchId,
        },
      };

      const unreadMsgCount = await this.getUnreadMessageCount(messageObject.fromId.toString(), messageObject.matchId.toString());
      cloneMessage.unreadMsgCount = unreadMsgCount;
      cloneMessage.fromUser = {
        _id: fromUser.id,
        userName: fromUser.userName,
        profilePic: relativeToFullImagePath(this.config, fromUser.profilePic),
      };
      targetUserSocketIds.forEach((socketId) => {
        this.server.to(socketId).emit('chatMessageReceived', {
          message: pick(cloneMessage, ['_id', 'image', 'urls', 'message', 'fromId', 'matchId', 'createdAt', 'unreadMsgCount', 'fromUser']),
        });
        // TODO: Remove messageV2, and messageV3 lines below as soon as the old Android and iOS apps
        // are retired.  These lines are only here for temporary compatibility.
        this.server.to(socketId).emit('messageV2', messageObjectReformattedForOldApi);
        this.server.to(socketId).emit('messageV3', messageObjectReformattedForOldApi);
      });
    }
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

  async getUnreadMessageCount(fromId: string, matchId: string) {
    const unreadCount = await this.messageModel
      .countDocuments({
        // deleted: false,
        isRead: false,
        fromId: new mongoose.Types.ObjectId(fromId),
        matchId: new mongoose.Types.ObjectId(matchId),
      })
      .exec();
    return unreadCount;
  }
}
