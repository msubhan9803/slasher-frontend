import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { FRIEND_RELATION_ID } from '../../constants';
import {
  MatchListRoomCategory,
  MatchListRoomType,
} from '../../schemas/matchList/matchList.enums';
import {
  MatchList,
  MatchListDocument,
} from '../../schemas/matchList/matchList.schema';
import { Message, MessageDocument } from '../../schemas/message/message.schema';

export interface Conversation extends MatchList {
  latestMessage: Message;
  unreadCount: number;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(MatchList.name)
    private matchListModel: Model<MatchListDocument>,
  ) {}

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
    let matchList = await this.matchListModel.findOne({
      participants: { $all: participants },
    });

    if (!matchList) {
      const insertData = {
        participants,
        relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
        roomType: MatchListRoomType.Match,
        roomCategory: MatchListRoomCategory.DirectMessage,
      };
      matchList = await this.matchListModel.create(insertData);
    }
    const messageObject = await this.messageModel.create({
      matchId: matchList,
      relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
      fromId: new mongoose.Types.ObjectId(fromUser),
      senderId: new mongoose.Types.ObjectId(toUser),
      message: image ? 'Image' : message,
      image,
    });
    await this.matchListModel.updateOne(
      { _id: matchList._id },
      { $set: { updatedAt: Date.now() } },
    );

    return messageObject;
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

  // async getConversations(userId: string, limit: number, before?: string): Promise<Conversation[]> {
  //   let beforeUpdatedAt;

  //   if (before) {
  //     const beforeMatchList = await this.matchListModel.findById(before).exec();
  //     beforeUpdatedAt = { $lt: beforeMatchList.updatedAt };
  //   }
  //   const conversations = await this.matchListModel.aggregate([
  //     {
  //       $match: {
  //         $and: [
  //           { participants: new mongoose.Types.ObjectId(userId) },
  //           before ? { updatedAt: beforeUpdatedAt } : {},
  //         ],
  //       },
  //     },
  //     { $sort: { updatedAt: -1 } },
  //     { $limit: limit },
  //     {
  //       $lookup: {
  //         from: 'messages',
  //         let: { local_id: '$_id' },
  //         as: 'latestMessage',
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: {
  //                 $eq: ['$$local_id', '$matchId'],
  //               },
  //               deleted: false,
  //             },
  //           },
  //           { $sort: { createdAt: -1 } },
  //           { $limit: 1 },
  //         ],
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'messages',
  //         let: { local_id: '$_id' },
  //         as: 'unreadCount',
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: {
  //                 $eq: ['$$local_id', '$matchId'],
  //               },
  //               isRead: false,
  //               // The unread count should only count messages that are unread and sent TO
  //               // the user requesting the conversation list.
  //               senderId: new mongoose.Types.ObjectId(userId), // this is who the message is "to"
  //             },
  //           },
  //           { $count: 'count' },
  //         ],
  //       },
  //     },
  //     { $unwind: '$latestMessage' },
  //     {
  //       $addFields: {
  //         unreadCount: { $sum: '$unreadCount.count' },
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'users',
  //         let: { local_id: '$latestMessage.senderId' },
  //         as: 'user',
  //         pipeline: [
  //           {
  //             $match: {
  //               $expr: {
  //                 $eq: ['$$local_id', '$_id'],
  //               },
  //             },
  //           },
  //           { $project: { _id: 1, userName: 1, profilePic: 1 } },
  //         ],
  //       },
  //     },
  //     { $unwind: '$user' },
  //     {
  //       $project: {
  //         _id: 1, user: 1, latestMessage: '$latestMessage.message', updatedAt: '$latestMessage.updatedAt', unreadCount: 1,
  //       },
  //     },
  //   ]);
  // const conversationsData = conversations.map((conversation) => {
  //   // eslint-disable-next-line no-param-reassign, prefer-destructuring
  //   conversation.latestMessage = conversation.latestMessage.trim().split('\n')[0];
  //   return conversation;
  // });
  //   return conversationsData;
  // }

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
          { participants: new mongoose.Types.ObjectId(userId) },
          before ? { updatedAt: beforeUpdatedAt } : {},
        ],
      })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    // const matchListIds = matchLists.map((id) => id._id);
    // console.log("matchListIds", matchListIds);

    // const latestMessage = await this.messageModel
    //   .find({ matchId: { $in: matchListIds } })
    //   .sort({ createdAt: -1 })
    //   .lean()
    //   .exec();
    // // console.log("latestMessage", latestMessage);
    // // const conversations: Conversation[] = [];
    // let c = 0;
    // const trimLatestMessage: any = latestMessage.map((lmessage) => {
    //   // eslint-disable-next-line no-param-reassign, prefer-destructuring
    //   lmessage.message = lmessage.message.trim().split("\n")[0];
    //   lmessage["unreadCount"] =
    //     lmessage.isRead === false && lmessage.fromId.toString() !== userId
    //       ? c++
    //       : c;
    //   return lmessage;
    // });
    // var uniqueLatestMessages = [];
    // trimLatestMessage.filter(function(item){
    //   var i = uniqueLatestMessages.findIndex(x => (x.matchId.toString() === item.matchId.toString()));
    //   if(i <= -1){
    //         uniqueLatestMessages.push(item);
    //   }
    //   return null;
    // });
    // console.log("uniqueLatestMessages", uniqueLatestMessages);

    // return uniqueLatestMessages

    // For each conversation, find its latest message and unread count
    const conversations = [];
    for (const matchList of matchLists) {
      const latestMessage = await this.messageModel
        .findOne({ matchId: matchList._id })
        .populate('senderId', 'userName _id profilePic')
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
          unreadCount,
          latestMessage: latestMessage.message.trim().split('\n')[0],
          user: latestMessage.senderId,
          updatedAt: latestMessage.updatedAt,
        });
      }
    }
    return conversations;
  }

  async findMatchList(id: string): Promise<any> {
    const matchList = await this.matchListModel
      .findById(id)
      .populate('participants', 'id userName firstName profilePic');
    return matchList;
  }
}
