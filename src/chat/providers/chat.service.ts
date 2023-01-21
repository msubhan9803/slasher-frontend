import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { FRIEND_RELATION_ID } from '../../constants';
import { Chat, ChatDocument } from '../../schemas/chat/chat.schema';
import {
  MatchListRoomCategory,
  MatchListRoomType,
} from '../../schemas/matchList/matchList.enums';
import {
  MatchList,
  MatchListDocument,
} from '../../schemas/matchList/matchList.schema';
import { Message, MessageDocument } from '../../schemas/message/message.schema';
import { NotificationReadStatus, NotificationDeletionStatus } from '../../schemas/notification/notification.enums';
import { UsersService } from '../../users/providers/users.service';

export interface Conversation extends MatchList {
  latestMessage: Message;
  unreadCount: number;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(MatchList.name) private matchListModel: Model<MatchListDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private usersService: UsersService,
  ) { }

  async createPrivateDirectMessageConversation(participants: mongoose.Types.ObjectId[]) {
    // Make sure that all of the participants exist
    if (participants.length < 2) {
      throw new Error('A conversation must have at least two participants.');
    }

    if (!this.usersService.usersExistAndAreActive(participants)) {
      throw new Error('One or more conversation participants could not be found');
    }

    const insertData = {
      participants,
      relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
      roomType: MatchListRoomType.Match,
      roomCategory: MatchListRoomCategory.DirectMessage,
    };
    const matchList = await this.matchListModel.create(insertData);

    // For compatibility with the old API, whenever a matchList is created, we also need to create a
    // corresponding Chat record with the same fields
    await this.chatModel.create({ ...insertData, matchId: matchList._id });

    return matchList;
  }

  async createOrFindPrivateDirectMessageConversationByParticipants(participants: mongoose.Types.ObjectId[]) {
    const matchList = await this.matchListModel.findOne({
      participants: { $all: participants },
      relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
      roomType: MatchListRoomType.Match,
      roomCategory: MatchListRoomCategory.DirectMessage,
    });

    return matchList || this.createPrivateDirectMessageConversation(participants);
  }

  async sendPrivateDirectMessage(
    fromUser: string,
    toUser: string,
    message: string,
    image?: string,
  ): Promise<MessageDocument> {
    const participants = [
      new mongoose.Types.ObjectId(fromUser),
      new mongoose.Types.ObjectId(toUser),
    ];

    // In addition to getting the correct MatchList, this also verifies that:
    // - The participants are all real users.
    // - The fromUser and toUser are definitely participants in the returned conversation.
    const matchList = await this.createOrFindPrivateDirectMessageConversationByParticipants(participants);

    const currentTime = Date.now();

    // Overwrite `updatedAt` of matchList
    const matchListUpdated = await this.matchListModel.findOneAndUpdate(
      { _id: matchList._id },
      { $set: { updatedAt: currentTime } },
      { new: true, timestamps: false },
    );

    const messageObject = await this.messageModel.create({
      matchId: matchListUpdated,
      relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
      fromId: new mongoose.Types.ObjectId(fromUser),
      senderId: new mongoose.Types.ObjectId(toUser), // due to bad old-API field naming, this is the "to" field
      message: image ? 'Image' : message,
      image,
      created: currentTime.toString(),
    });

    // Overwrite `createdAt` of message
    messageObject.createdAt = currentTime as any;
    await messageObject.save({ timestamps: true });

    return messageObject as unknown as MessageDocument;
  }

  async getMessages(
    matchListId: string,
    requiredParticipantId: string,
    limit: number,
    before?: string,
  ): Promise<Message[]> {
    const where: any = [
      { matchId: new mongoose.Types.ObjectId(matchListId) },
      { partcipants: new mongoose.Types.ObjectId(requiredParticipantId) },
      { deleted: false },
    ];
    let beforeCreatedAt;

    if (before) {
      const beforeMessage = await this.messageModel.findById(before).exec();
      beforeCreatedAt = { $lt: beforeMessage.createdAt };
    }

    const messages = await this.messageModel
      .find({
        $and: [...where, before ? { createdAt: beforeCreatedAt } : {}],
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return messages;
  }

  async getUnreadDirectPrivateMessageCount(userId: string): Promise<number> {
    const messageCount = await this.messageModel
      .find({
        $and: [{
          senderId: new mongoose.Types.ObjectId(userId), // due to bad old-API field naming, this is the "to" field
          isRead: NotificationReadStatus.Unread,
          is_deleted: NotificationDeletionStatus.NotDeleted,
          relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
        }],
      })
      .count()
      .exec();
    return messageCount;
  }

  async getConversations(
    userId: string,
    limit: number,
    before?: string,
  ): Promise<Conversation[]> {
    let beforeUpdatedAt;

    if (before) {
      const beforeMatchList = await this.matchListModel.findById(before).exec();
      beforeUpdatedAt = { $lt: beforeMatchList.updatedAt };
    }

    const matchLists: any = await this.matchListModel
      .find({
        $and: [
          {
            participants: new mongoose.Types.ObjectId(userId),
            roomType: MatchListRoomType.Match,
            roomCategory: MatchListRoomCategory.DirectMessage,
            relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
          },
          before ? { updatedAt: beforeUpdatedAt } : {},
        ],
      })
      .populate('participants', 'userName _id profilePic')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    // For each conversation, find its latest message and unread count
    const conversations = [];
    for (const matchList of matchLists) {
      const latestMessage = await this.messageModel
        .findOne({ matchId: matchList._id })
        .sort({ createdAt: -1 })
        .exec();
      const unreadCount = await this.messageModel
        .countDocuments({
          isRead: false,
          fromId: { $ne: new mongoose.Types.ObjectId(userId) },
          matchId: matchList._id,
        })
        .sort({ createdAt: -1 })
        .limit(1)
        .exec();
      if (latestMessage) {
        conversations.push({
          _id: matchList._id,
          participants: matchList.participants,
          unreadCount,
          latestMessage: latestMessage.message.trim().split('\n')[0],
          updatedAt: matchList.updatedAt,
        });
      }
    }
    return conversations;
  }

  async findMatchList(id: string) {
    const matchList = await this.matchListModel
      .findById(id)
      .populate('participants', '_id userName firstName profilePic');
    return matchList;
  }

  /** Call this service function to mark all messages received from all participants for a given chat for a user.
   * @param receiverUserId This refers to receiver user
   * @param matchListId Match id for a chat
   */
  async markAllReceivedMessagesReadForChat(receiverUserId: string, matchListId: string) {
    const matchListDoc = await this.matchListModel.findById(matchListId);
    if (!matchListDoc) throw new Error('matchList document not found for given `matchListId`');

    const participants = matchListDoc.participants.map((userObjectId) => userObjectId.toString());
    if (!participants.find((p) => p === receiverUserId)) {
      throw new Error('You are not a part of this chat. Invalid `matchListId`.');
    }

    await this.messageModel
      .updateMany({
        matchId: matchListDoc._id,
        isRead: NotificationReadStatus.Unread,
        senderId: receiverUserId, // due to bad old-API field naming, this is the "to" field
      }, { isRead: NotificationReadStatus.Read })
      .exec();
  }
}
