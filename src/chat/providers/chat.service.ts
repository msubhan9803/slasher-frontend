/* eslint-disable max-lines */
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
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
import { NotificationReadStatus } from '../../schemas/notification/notification.enums';
import { UsersService } from '../../users/providers/users.service';
import { BlocksService } from '../../blocks/providers/blocks.service';

export interface Conversation extends MatchList {
  latestMessage: Message;
  unreadCount: number;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(MatchList.name) private matchListModel: Model<MatchListDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private usersService: UsersService,
    private readonly blocksService: BlocksService,
  ) { }

  async createPrivateDirectMessageConversation(participants: mongoose.Types.ObjectId[]) {
    // Make sure that all of the participants exist
    if (participants.length < 2) {
      throw new Error('A conversation must have at least two participants.');
    }

    if (participants.find((participantId) => typeof (participantId) === 'string')) {
      throw new Error('Participant ids must be ObjectIds');
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
    if (participants.find((participantId) => typeof (participantId) === 'string')) {
      throw new Error('Participant ids must be ObjectIds');
    }

    const matchList = await this.matchListModel.findOne({
      participants: { $all: participants },
      relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
      roomType: MatchListRoomType.Match,
      roomCategory: MatchListRoomCategory.DirectMessage,
      deleted: false,
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

    const messageSession = await this.connection.startSession();
    messageSession.startTransaction();
    const [messageObject] = (await this.messageModel.create(
      [{
        matchId: matchList._id,
        relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
        fromId: new mongoose.Types.ObjectId(fromUser),
        senderId: new mongoose.Types.ObjectId(toUser), // due to bad old-API field naming, this is the "to" field
        message: image ? 'Image' : message,
        image,
        created: currentTime.toString(),
        createdAt: currentTime, // overwrite `createdAt`
      }],
      { timestamps: false },
    ) as unknown as MessageDocument[]);

    await this.matchListModel.updateOne(
      { _id: matchList._id },
      {
        $set: {
          updatedAt: currentTime, // overwrite `updatedAt`
          lastMessageSentAt: currentTime,
        },
      },
      { timestamps: false },
    );
    await this.chatModel.updateOne(
      { matchId: matchList._id },
      { $set: { updatedAt: currentTime } }, // overwrite `updatedAt`
      { timestamps: false },
    );
    messageSession.endSession();

    return messageObject;
  }

  async getMessages(
    matchListId: string,
    requiredParticipantId: string,
    limit: number,
    before?: string,
  ): Promise<Message[]> {
    const where: any = [
      {
        matchId: new mongoose.Types.ObjectId(matchListId),
        partcipants: new mongoose.Types.ObjectId(requiredParticipantId),
        deleted: false,
        deletefor: { $ne: new mongoose.Types.ObjectId(requiredParticipantId) },
      },
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
          isRead: false,
          deleted: false,
          relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
          deletefor: { $ne: new mongoose.Types.ObjectId(userId) },
        },
        ],
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

    // Do not return conversations of blocked users
    const blockUserIds = (await this.blocksService.getUserIdsForBlocksToOrFromUser(userId)).map((id) => new mongoose.Types.ObjectId(id));

    const matchLists = await this.matchListModel
      .find({
        deleted: false,
        participants: { $in: new mongoose.Types.ObjectId(userId), $nin: blockUserIds },
        roomType: MatchListRoomType.Match,
        roomCategory: MatchListRoomCategory.DirectMessage,
        relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
        ...(before ? { updatedAt: beforeUpdatedAt } : {}),
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
        .findOne({
          matchId: matchList._id,
          deletefor: { $ne: new mongoose.Types.ObjectId(userId) },
          // TODO: Exclude {deleted: true} messages
        })
        .sort({ createdAt: -1 })
        .exec();
      const unreadCount = await this.messageModel
        .countDocuments({ // TODO: Exclude {deleted: true} messages
          isRead: false,
          fromId: { $ne: new mongoose.Types.ObjectId(userId) },
          matchId: matchList._id,
        })
        .sort({ createdAt: -1 })
        // .limit(1)
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

  async findMatchList(id: string, activeOnly: boolean): Promise<any> {
    const matchList = await this.matchListModel
      .findOne({
        _id: new mongoose.Types.ObjectId(id),
        ...(activeOnly ? { deleted: false } : {}),
      })
      .populate('participants', 'id userName firstName profilePic');
    return matchList;
  }

  /** Call this service function to mark all messages received from all participants for a given chat for a user.
   * @param receiverUserId This refers to receiver user
   * @param matchListId Match id for a chat
   */
  async markAllReceivedMessagesReadForChat(receiverUserId: string, matchListId: string) {
    const matchListDoc = await this.matchListModel.findById(matchListId);
    if (!matchListDoc) { throw new Error('matchList document not found for given `matchListId`'); }

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

  async markMessageAsRead(messageId: string): Promise<MessageDocument> {
    return this.messageModel
      .findOneAndUpdate({ _id: messageId }, { $set: { isRead: true } }, { new: true })
      .exec();
  }

  async findByMessageId(messageId: string): Promise<MessageDocument> {
    return this.messageModel.findOne({ _id: messageId }).exec();
  }

  /**
   * Deletes private direct message conversations and all messages in the conversation.
   * Note: This can sometimes delete multiple MatchLists because the old API will sometimes create
   * more than one conversation over time, if a user unfriends and then re-friends another user.
   * @param fromUserId
   * @param toUserId
   */
  async deletePrivateDirectMessageConversations(fromUserId: string, toUserId: string): Promise<any> {
    const participants = [
      new mongoose.Types.ObjectId(fromUserId),
      new mongoose.Types.ObjectId(toUserId),
    ];
    await this.matchListModel.updateOne(
      {
        participants: { $all: participants },
        relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
        roomType: MatchListRoomType.Match,
        roomCategory: MatchListRoomCategory.DirectMessage,
      },
      { $set: { deleted: true } },
    );

    await this.chatModel.updateOne(
      {
        participants: { $all: participants },
        relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
        roomType: MatchListRoomType.Match,
        roomCategory: MatchListRoomCategory.DirectMessage,
      },
      { $set: { deleted: true } },
    );
    await this.messageModel.updateMany(
      {
        $or: [
          { fromId: new mongoose.Types.ObjectId(fromUserId), senderId: new mongoose.Types.ObjectId(toUserId) },
          { fromId: new mongoose.Types.ObjectId(toUserId), senderId: new mongoose.Types.ObjectId(fromUserId) },
        ],
      },
      { $set: { deleted: true } },
    );
  }

  async deleteConversationMessages(userId: string, matchListId: string) {
    const matchListDoc = await this.matchListModel.findById(matchListId);
    if (!matchListDoc) { throw new Error(`matchList document not found for given ${matchListId}`); }

    const participants = matchListDoc.participants.map((userObjectId) => userObjectId.toString());
    if (!participants.find((p) => p === userId)) {
      throw new Error(`User with id ${userId} is not a member of MatchList ${matchListId}`);
    }

    await this.messageModel.updateMany(
      {
        matchId: matchListDoc._id,
        deletefor: { $ne: new mongoose.Types.ObjectId(userId) },
      },
      { $addToSet: { deletefor: new mongoose.Types.ObjectId(userId) } },
    );
  }
}
