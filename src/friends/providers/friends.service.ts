import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { SuggestBlockReaction } from '../../schemas/suggestBlock/suggestBlock.enums';
import { SuggestBlock, SuggestBlockDocument } from '../../schemas/suggestBlock/suggestBlock.schema';
import { FriendRequestReaction } from '../../schemas/friend/friend.enums';
import { Friend, FriendDocument } from '../../schemas/friend/friend.schema';
import { User, UserDocument } from '../../schemas/user/user.schema';
import { escapeStringForRegex } from '../../utils/escape-utils';

@Injectable()
export class FriendsService {
  constructor(
    @InjectModel(Friend.name) private friendsModel: Model<FriendDocument>,
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    @InjectModel(SuggestBlock.name) private suggestBlockModel: Model<SuggestBlockDocument>,
  ) { }

  async findFriendship(fromUserId: string, toUserId: string): Promise<Friend | null> {
    return this.friendsModel
      .findOne({
        $or: [
          { from: new mongoose.Types.ObjectId(fromUserId), to: new mongoose.Types.ObjectId(toUserId) },
          { from: new mongoose.Types.ObjectId(toUserId), to: new mongoose.Types.ObjectId(fromUserId) },
        ],
      })
      .exec();
  }

  async createFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
    let friend: any = await this.friendsModel
      .findOne({
        $or: [
          { from: new mongoose.Types.ObjectId(fromUserId), to: new mongoose.Types.ObjectId(toUserId) },
          { from: new mongoose.Types.ObjectId(toUserId), to: new mongoose.Types.ObjectId(fromUserId) },
        ],
      })
      .exec();

    if (friend && friend.reaction === FriendRequestReaction.DeclinedOrCancelled) {
      await this.friendsModel.deleteOne({ _id: friend._id });
      friend = null; // clear out friend variable so new request is created below
    }

    if (!friend) {
      const friends = {
        from: new mongoose.Types.ObjectId(fromUserId),
        to: new mongoose.Types.ObjectId(toUserId),
        reaction: FriendRequestReaction.Pending,
      };
      friend = await this.friendsModel.create(friends);
    }

    if (friend.reaction === FriendRequestReaction.Accepted) {
      throw new Error('Cannot create friend request. Already friends.');
    }

    if (friend?.reaction === FriendRequestReaction.Pending && friend?.to.toString() === fromUserId.toString()) {
      await this.acceptFriendRequest(friend.from, friend.to);
    }
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
      .populate('from', 'userName _id profilePic firstName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
    const friendsData = friends.map((friend) => ({
      _id: friend.from._id, userName: friend.from.userName, profilePic: friend.from.profilePic, firstName: friend.from.firstName,
    })) as Partial<UserDocument[]>;
    return friendsData;
  }

  async cancelFriendshipOrDeclineRequest(userId1: string, userId2: string): Promise<void> {
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

  /**
   * For the given user, returns an array of ObjectIds for that user's friends (and optionally,
   * pending friends from sent or received friend requests).
   * Note: This methon can return a lot of results (thousands) if the user has a lot of friends.
   */
  async getFriendIds(userId: string, includePendingFriends = false) {
    const friendReactionFilter = {
      reaction: includePendingFriends
        ? { $in: [FriendRequestReaction.Accepted, FriendRequestReaction.Pending] }
        : FriendRequestReaction.Accepted,
    };

    const results = await this.friendsModel.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { from: new mongoose.Types.ObjectId(userId) },
                { to: new mongoose.Types.ObjectId(userId) },
              ],
            },
            friendReactionFilter,
          ],
        },
      },
      { $group: { _id: null, from: { $addToSet: '$from' }, to: { $addToSet: '$to' } } },
      {
        $project: {
          _id: 0,
          id: { $setUnion: ['$from', '$to'] },
        },
      },
      { $unwind: '$id' },
    ]).exec();

    // Exclude userId and return list of friend ObjectId values
    const userIdToExclude = new mongoose.Types.ObjectId(userId);
    const processedResults = (results.map((result) => result.id) as mongoose.Types.ObjectId[]).filter(
      (id) => !id.equals(userIdToExclude),
    );

    return processedResults;
  }

  async getFriends(userId: string, limit: number, offset: number, userNameContains?: string) {
    const friendIds = await this.getFriendIds(userId);
    const friendUsers = await this.usersModel.find({
      $and: [
        { _id: { $in: friendIds } },
        userNameContains ? { userName: new RegExp(escapeStringForRegex(userNameContains), 'i') } : {},
      ],
    }).limit(limit).skip(offset).sort({ userName: 1 })
      .select({
        userName: 1, profilePic: 1, _id: 1, firstName: 1,
      })
      .exec();

    return {
      allFriendCount: friendIds.length,
      friends: friendUsers,
    };
  }

  async getSuggestedFriends(user: UserDocument, limit: number) {
    const friendIds = await this.getFriendIds(user._id, true);
    const suggestBlockUserIds = await this.getSuggestBlockedUserIdsBySender(user._id);
    const friendUsers = await this.usersModel.find({
      $and: [
        { _id: { $nin: friendIds } },
        { _id: { $nin: suggestBlockUserIds } },
        { _id: { $ne: user._id } },
      ],
    }).sort({ createdAt: -1 }).limit(limit)
      .select({ userName: 1, profilePic: 1, _id: 1 })
      .exec();
    return friendUsers;
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

  async getReceivedFriendRequestCount(userId: string): Promise<number> {
    const friendsCount = await this.friendsModel
      .find({
        $and: [{ to: new mongoose.Types.ObjectId(userId) }, { reaction: FriendRequestReaction.Pending }],
      })
      .count()
      .exec();
    return friendsCount;
  }

  async createSuggestBlock(fromUserId: string, toUserId: string): Promise<void> {
    const fromAndTo = {
      from: new mongoose.Types.ObjectId(fromUserId),
      to: new mongoose.Types.ObjectId(toUserId),
    };

    await this.suggestBlockModel.findOneAndUpdate(fromAndTo, { $set: { reaction: SuggestBlockReaction.Block } }, { upsert: true });
  }

  async getSuggestBlockedUserIdsBySender(fromUserId: string): Promise<Partial<User[]>> {
    const fromAndBlockQuery = {
      from: new mongoose.Types.ObjectId(fromUserId),
      reaction: SuggestBlockReaction.Block,
    };

    const suggestBlock = await this.suggestBlockModel.find(fromAndBlockQuery).select('to');

    return suggestBlock.map((data) => data.to);
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.friendsModel
      .deleteMany({
        $or: [{ to: new mongoose.Types.ObjectId(userId) }, { from: new mongoose.Types.ObjectId(userId) }],
      })
      .exec();
  }
}
