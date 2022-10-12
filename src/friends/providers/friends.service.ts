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
    const friendsData = friends.map((friend) => {
      const friendTo = friend.to as any;
      return ({
        userName: friendTo.userName, _id: friendTo._id, profilePic: friendTo.profilePic,
      });
    }) as Partial<UserDocument[]>;
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
    const friendsData = friends.map((friend) => {
      const friendFrom = friend.from as any;
      return ({
        _id: friendFrom._id, userName: friendFrom.userName, profilePic: friendFrom.profilePic,
      });
    }) as Partial<UserDocument[]>;
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
}
