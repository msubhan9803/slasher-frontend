import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { RssFeedProviderFollow, RssFeedProviderFollowDocument } from '../../schemas/rssFeedProviderFollow/rssFeedProviderFollow.schema';
import { FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';
import { FriendRequestReaction } from '../../schemas/friend/friend.enums';
// import {  } from '../../schemas/rssFeedProviderFollow/rssFeedProviderFollow.enums';

@Injectable()
export class RssFeedProviderFollowsService {
  constructor(@InjectModel(RssFeedProviderFollow.name) private rssFeedProviderFollowModel: Model<RssFeedProviderFollowDocument>) { }

  async create(rssfeedProviderFollowData: Partial<RssFeedProviderFollow>) {
    return this.rssFeedProviderFollowModel.create(rssfeedProviderFollowData);
  }

  async update(id: string, rssfeedProviderFollowData: Partial<RssFeedProviderFollow>): Promise<RssFeedProviderFollow> {
    return this.rssFeedProviderFollowModel
      .findOneAndUpdate({ _id: id }, rssfeedProviderFollowData, { new: true })
      .exec();
  }

  async findById(id: string): Promise<RssFeedProviderFollow> {
    return this.rssFeedProviderFollowModel.findOne({ _id: id }).exec();
  }

  async findMainFeedPostsForUser(userId: string, limit: number, before?: mongoose.Types.ObjectId): Promise<FeedPostDocument[]> {
    const aggregateQuery = [
      {
        $lookup:
        {
          from: "rssfeedproviderfollows",
          pipeline: [
            {
              $match: {
                $and: [
                  { userId: { $eq: new mongoose.Types.ObjectId(userId) } },
                  { status: { $eq: 1 } }
                ],
              },
            },
            { $group: { _id: null, rssfeedProviderId: { $addToSet: '$rssfeedProviderId' } } },
          ],
          as: "rssFeedProviderFollowsDetails"
        }
      },
      { $unwind: "$rssFeedProviderFollowsDetails" },
      {
        $lookup: {
          from: 'friends',
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $or: [
                      { from: { $eq: new mongoose.Types.ObjectId(userId) } },
                      { to: { $eq: new mongoose.Types.ObjectId(userId) } }
                    ],
                  },
                  { reaction: 3 },
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
          ],
          as: 'friendsDetails',
        }
      },
      { $unwind: "$friendsDetails" },
      {
        $project: {
          _id: 1,
          userId: 1,
          rssFeedProviderId: 1,
          message: 1,
          images: 1,
          userIdList: '$friendsDetails.ids',
          rssFeedProviderIdList: '$rssFeedProviderFollowsDetails.rssfeedProviderId'
        },
      },
    ]
    //   const frssfeedProviderFollowData: any = await this.rssFeedProviderFollowModel.aggregate(aggregateQuery);

    // }

  }
