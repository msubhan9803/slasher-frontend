import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { HashTagsFollow, HashTagsFollowDocument } from '../../schemas/hashtagFollow/hashtagFollows.schema';
import { ProfileVisibility } from '../../schemas/user/user.enums';
import { FriendsService } from '../../friends/providers/friends.service';
import { FriendRequestReaction } from '../../schemas/friend/friend.enums';

@Injectable()
export class HashtagFollowsService {
  constructor(
    @InjectModel(HashTagsFollow.name) private hashtagFollowModel: Model<HashTagsFollowDocument>,
    private friendsService: FriendsService,
  ) { }

  async create(hashtagFollowData: Partial<HashTagsFollow>) {
    return this.hashtagFollowModel.create(hashtagFollowData);
  }

  async findById(id: string): Promise<HashTagsFollow> {
    return this.hashtagFollowModel.findOne({ _id: id }).exec();
  }

  async findOneAndUpdateHashtagFollow(userId: string, hashTagId: string, notification: boolean): Promise<HashTagsFollowDocument> {
    return this.hashtagFollowModel
      .findOneAndUpdate(
        { $and: [{ userId }, { hashTagId }] },
        { $set: { userId, hashTagId, notification } },
        { upsert: true, new: true },
      ).exec();
  }

  async findByUserAndHashtag(userId: string, hashTagId: string): Promise<HashTagsFollow> {
    return this.hashtagFollowModel.findOne({
      userId,
      hashTagId,
    }).exec();
  }

  async deleteById(id: string): Promise<void> {
    await this.hashtagFollowModel.deleteOne({ _id: id }).exec();
  }

  async findAllByUserId(userId: string): Promise<HashTagsFollow[]> {
    return this.hashtagFollowModel
      .find({ userId }, {
        hashTagId: 1, userId: 1, notification: 1, _id: 0,
      }).populate('hashTagId')
      .exec();
  }

  async insertManyHashtagFollow(userId: string, hashTagId: string[]) {
    const hastags = [];
    for (let i = 0; i < hashTagId.length; i += 1) {
      hastags.push(await this.hashtagFollowModel
        .create({ userId, hashTagId: hashTagId[i] }));
    }
    return hastags;
  }

  async sendNotificationOfHashtagFollows(hashtagIdsArr: string[], user: object) {
    const allUserIds = await this.hashtagFollowModel.aggregate([
      {
        $match: {
          $and: [
            { hashTagId: { $in: hashtagIdsArr } },
            { notification: 1 },
          ],
        },
      },
      {
        $group: {
          _id: '$userId',
        },
      },
    ]);

    let userIds;
    if ((user as any).profile_status === ProfileVisibility.Private) {
      const allFriendIds = await this.friendsService.getFriendIds((user as any)._id, [FriendRequestReaction.Accepted]);
      userIds = allUserIds.map(({ _id }) => _id.toString());
      const friendIds = _.intersection(userIds, allFriendIds.map((userId) => userId.toString()));
      return friendIds;
    }
    return allUserIds;
  }
}
