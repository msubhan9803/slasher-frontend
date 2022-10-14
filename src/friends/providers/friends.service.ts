import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { FriendRequestReaction } from '../../schemas/friend/friend.enums';
import { Friend, FriendDocument } from '../../schemas/friend/friend.schema';
import { UserDocument } from '../../schemas/user/user.schema';

@Injectable()
export class FriendsService {
  constructor(@InjectModel(Friend.name) private friendsModel: Model<FriendDocument>) { }

  async getFriendRequestReaction(fromUserId: string, toUserId: string): Promise<FriendRequestReaction | null> {
    const friend = await this.friendsModel
      .findOne({
        $and: [{ from: new mongoose.Types.ObjectId(fromUserId) }, { to: new mongoose.Types.ObjectId(toUserId) }],
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
      .skip((offset - 1) * limit)
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
      .skip((offset - 1) * limit)
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
      .findOneAndUpdate(friends, { $set: { reaction: FriendRequestReaction.DeclinedOrCancelled } }, { new: true })
      .exec();
  }

  async getFriends(userId: string, limit: number, offset: number, userNameContains?: string): Promise<Partial<UserDocument[]>> {
    const offsetFriends = (offset - 1) * limit;
    const limitFriends = limit;

    const matchQuery: any = {
      $match: { $expr: { _id: { $in: ['$_id', '$$ids'] } } },
    };

    if (userNameContains) {
      matchQuery.$match.userName = new RegExp(userNameContains, 'i');
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
          ],
          as: 'usersDetails',
        },
      },
      { $project: { usersDetails: { $slice: ['$usersDetails', offsetFriends, limitFriends] } } },
    ];

    const friendsData: any = await this.friendsModel.aggregate(aggregateQuery);
    return friendsData.length ? friendsData[0].usersDetails : friendsData;
  }

  async acceptFriendRequest(userId1: string, userId2: string): Promise<void> {
    const acceptFriendRequestQuery = {
      $and: [
        {
          $or: [
            { from: new mongoose.Types.ObjectId(userId1), to: new mongoose.Types.ObjectId(userId2) },
            { from: new mongoose.Types.ObjectId(userId2), to: new mongoose.Types.ObjectId(userId1) },
          ],
        },
        { reaction: FriendRequestReaction.Pending },
      ],
    };
    const friends = await this.friendsModel.find(acceptFriendRequestQuery);
    if (friends.length) {
      const friendIds = friends.map((friend) => friend._id);
      await this.friendsModel.updateMany({ _id: friendIds }, { $set: { reaction: FriendRequestReaction.Accepted } }, { multi: true });
    } else {
      throw new Error(`No pending friend request found for ${userId1} and ${userId2}`);
    }
  }
}
