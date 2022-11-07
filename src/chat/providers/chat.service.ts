import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { FRIEND_RELATION_ID } from '../../constants';
import { MatchListRoomCategory, MatchListRoomType } from '../../schemas/matchList/matchList.enums';
import { MatchList, MatchListDocument } from '../../schemas/matchList/matchList.schema';
import { Message, MessageDocument } from '../../schemas/message/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(MatchList.name) private matchListModel: Model<MatchListDocument>,
  ) { }

  async sendPrivateDirectMessage(fromUser: string, toUser: string, message: string, image?: string): Promise<Message> {
    const participants = [new mongoose.Types.ObjectId(fromUser), new mongoose.Types.ObjectId(toUser)];
    const insertData = {
      participants,
      relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
      roomType: MatchListRoomType.Match,
      roomCategory: MatchListRoomCategory.DirectMessage,
    };
    const filter = {
      participants: {
        $all: [
          { $elemMatch: { $eq: new mongoose.Types.ObjectId(fromUser) } },
          { $elemMatch: { $eq: new mongoose.Types.ObjectId(toUser) } },
        ],
      },
    };
    const matchList = await this.matchListModel
      .findOneAndUpdate(filter, insertData, { new: true, upsert: true })
      .exec();
    const messageInfo = await this.messageModel.create({
      matchId: matchList,
      relationId: new mongoose.Types.ObjectId(FRIEND_RELATION_ID),
      fromId: new mongoose.Types.ObjectId(fromUser),
      senderId: new mongoose.Types.ObjectId(toUser),
      message: image ? 'Image' : message,
      image,
    });
    await matchList.update();

    return messageInfo;
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
      { deletedAt: false },
    ];
    let beforeCreatedAt;

    if (before) {
      const beforeMessage = await this.messageModel.findById(before).exec();
      beforeCreatedAt = beforeMessage.createdAt;
    }

    const messages = await this.messageModel
      .find({
        $and: [
          ...where,
          before ? { createdAt: { $lt: { beforeCreatedAt } } } : {},
        ],
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return messages;
  }

  async getConversations(userId: string, limit: number, before?: string): Promise<MatchList[]> {
    let beforeUpdatedAt;

    if (before) {
      const beforeMatchList = await this.matchListModel.findById(before).exec();
      beforeUpdatedAt = beforeMatchList.updatedAt;
    }
    const matchLists = await this.matchListModel.find({
      $and: [
        { participants: new mongoose.Types.ObjectId(userId) },
        before ? { updatedAt: { $lt: beforeUpdatedAt } } : {},
      ],
    }).sort({ updatedAt: -1 }).limit(limit).exec();

    return matchLists;
  }
}
