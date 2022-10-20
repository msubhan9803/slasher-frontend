import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { FriendRequestReaction } from '../../schemas/friend/friend.enums';
import { Friend, FriendDocument } from '../../schemas/friend/friend.schema';
import { UserDocument } from '../../schemas/user/user.schema';
import { escapeStringForRegex } from '../../utils/escape-utils';

@Injectable()
export class FriendsService {
  constructor(@InjectModel(Friend.name) private friendsModel: Model<FriendDocument>) { }

  async getFriendRequestReaction(userId1: string, userId2: string): Promise<FriendRequestReaction | null> {
    const friend = await this.friendsModel
      .findOne({
        $or: [
          { from: new mongoose.Types.ObjectId(userId1), to: new mongoose.Types.ObjectId(userId2) },
          { from: new mongoose.Types.ObjectId(userId2), to: new mongoose.Types.ObjectId(userId1) },
        ],
      })
      .exec();
    return friend ? friend.reaction : null;
  }

  async createFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
    const currentFriendReaction = await this.getFriendRequestReaction(fromUserId, toUserId);
    if (currentFriendReaction === FriendRequestReaction.Accepted) {
      throw new Error('Cannot create friend request. Already friends.');
    }

    if (currentFriendReaction === FriendRequestReaction.Pending) {
      return;
    }
    const friends = {
      from: new mongoose.Types.ObjectId(fromUserId),
      to: new mongoose.Types.ObjectId(toUserId),
      reaction: FriendRequestReaction.Pending,
    };
    await this.friendsModel.create(friends);
  }

  async getSentFriendRequests(userId: string, limit: number, offset?: number): Promise<Partial<UserDocument[]>> {
    const friends = await this.friendsModel
      .find({
        $and: [{ from: new mongoose.Types.ObjectId(userId) }, { reaction: FriendRequestReaction.Pending }],
      })
      .populate('to', 'userName _id profilePic')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
    const friendsData = friends.map((friend) => ({
      _id: friend.to._id, userName: friend.to.userName, profilePic: friend.to.profilePic,
    })) as Partial<UserDocument[]>;
    return friendsData;
  }

  async getReceivedFriendRequests(userId: string, limit: number, offset?: number): Promise<Partial<UserDocument[]>> {
    const friends = await this.friendsModel
      .find({
        $and: [{ to: new mongoose.Types.ObjectId(userId) }, { reaction: FriendRequestReaction.Pending }],
      })
      .populate('from', 'userName _id profilePic')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
    const friendsData = friends.map((friend) => ({
      _id: friend.from._id, userName: friend.from.userName, profilePic: friend.from.profilePic,
    })) as Partial<UserDocument[]>;
    return friendsData;
  }

  async declineOrCancelFriendRequest(userId1: string, userId2: string): Promise<void> {
    const friends = {
      $or: [
        { from: new mongoose.Types.ObjectId(userId1), to: new mongoose.Types.ObjectId(userId2) },
        { from: new mongoose.Types.ObjectId(userId2), to: new mongoose.Types.ObjectId(userId1) },
      ],
    };
    await this.friendsModel
      .updateOne(friends, { $set: { reaction: FriendRequestReaction.DeclinedOrCancelled } }, { new: true })
      .exec();
  }

  async getFriends(userId: string, limit: number, offset: number, userNameContains?: string): Promise<Partial<UserDocument[]>> {
    const matchQuery: any = {
      $match: {
        $expr: {
          $and: [
            { $ne: ['$_id', new mongoose.Types.ObjectId(userId)] },
            { $in: ['$_id', '$$ids'] },
          ],
        },
      },
    };

    if (userNameContains) {
      matchQuery.$match.userName = new RegExp(escapeStringForRegex(userNameContains), 'i');
    }

    const aggregateQuery = [
      {
        $match: {
          $and: [
            {
              $or: [
                { from: new mongoose.Types.ObjectId(userId) },
                { to: new mongoose.Types.ObjectId(userId) },
              ],
            },
            { reaction: FriendRequestReaction.Accepted },
          ],
        },
      },
      { $group: { _id: null, from: { $addToSet: '$from' }, to: { $addToSet: '$to' } } },
      {
        $project: {
          _id: 0,
          ids: { $setUnion: ['$from', '$to'] },
        },
      },
      {
        $lookup:
        {
          from: 'users',
          let: { ids: '$ids' },
          pipeline: [
            matchQuery,
            { $project: { userName: 1, profilePic: 1, _id: 1 } },
            { $sort: { userName: 1 } },
          ],
          as: 'usersDetails',
        },
      },
      { $project: { usersDetails: { $slice: ['$usersDetails', offset, limit] } } },
    ];

    const friendsData: any = await this.friendsModel.aggregate(aggregateQuery);
    return friendsData.length ? friendsData[0].usersDetails : friendsData;
  }

  async acceptFriendRequest(fromUser: string, toUser: string): Promise<void> {
    const notFoundMessage = `No pending friend request found from user ${fromUser} to ${toUser}`;

    const friendRequest = await this.friendsModel.findOne({ from: fromUser, to: toUser });

    if (!friendRequest) {
      throw new Error(notFoundMessage);
    }

    if (friendRequest.reaction === FriendRequestReaction.Accepted) {
      return;
    }

    if (friendRequest.reaction !== FriendRequestReaction.Pending) {
      throw new Error(notFoundMessage);
    }

    friendRequest.reaction = FriendRequestReaction.Accepted;
    await friendRequest.save();
  }
}
