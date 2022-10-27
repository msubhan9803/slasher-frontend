import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { FriendsService } from '../../friends/providers/friends.service';
import { RssFeedProviderFollowsService } from '../../rss-feed-provider-follows/providers/rss-feed-provider-follows.service';
import { FeedPostDeletionState, FeedPostStatus } from '../../schemas/feedPost/feedPost.enums';
import { FeedPost, FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';

@Injectable()
export class FeedPostsService {
  constructor(
    @InjectModel(FeedPost.name) private feedPostModel: Model<FeedPostDocument>,
    private readonly rssFeedProviderFollowsService: RssFeedProviderFollowsService,
    private readonly friendsService: FriendsService,
  ) { }

  async create(feedPostData: Partial<FeedPost>): Promise<FeedPostDocument> {
    return this.feedPostModel.create(feedPostData);
  }

  async update(id: string, feedPostData: Partial<FeedPost>): Promise<FeedPostDocument> {
    return this.feedPostModel
      .findOneAndUpdate({ _id: id }, feedPostData, { new: true })
      .exec();
  }

  async findById(id: string, activeOnly: boolean): Promise<FeedPostDocument> {
    const feedPostFindQuery: any = { _id: id };
    if (activeOnly) {
      feedPostFindQuery.is_deleted = false;
      feedPostFindQuery.status = FeedPostStatus.Active;
    }
    return this.feedPostModel.findOne(feedPostFindQuery).populate('userId', 'userName _id profilePic').exec();
  }

  async findAllByUser(userId: string, limit: number, activeOnly: boolean, before?: mongoose.Types.ObjectId): Promise<FeedPostDocument[]> {
    const feedPostFindAllQuery: any = {};
    const feedPostQuery = [];
    feedPostQuery.push({ userId });
    if (before) {
      const feedPost = await this.feedPostModel.findById(before).exec();
      feedPostQuery.push({ createdAt: { $lt: feedPost.createdAt } });
    }
    if (activeOnly) {
      feedPostFindAllQuery.is_deleted = FeedPostDeletionState.NotDeleted;
      feedPostFindAllQuery.status = FeedPostStatus.Active;
      feedPostQuery.push(feedPostFindAllQuery);
    }
    return this.feedPostModel
      .find({ $and: feedPostQuery })
      .populate('userId', 'userName _id profilePic')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findMainFeedPostsForUser(userId: string, limit: number, before?: mongoose.Types.ObjectId): Promise<FeedPostDocument[]> {
    // Get the list of rss feed providers that the user is following
    const rssFeedProviderIds = (await this.rssFeedProviderFollowsService.findAllByUserId(userId)).map((follow) => follow.rssfeedProviderId);
    // Get the list of friend ids

    // TODO: This is NOT efficient, and is only temporary.  This should be combined with the main query as a $lookup.
    const friendIds = (await this.friendsService.getFriends(userId, 20_000, 0)).map((friend) => friend._id);

    // Optionally, only include posts that are older than the given `before` post
    const beforeQuery: any = {};
    if (before) {
      const feedPost = await this.feedPostModel.findById(before).exec();
      beforeQuery.createdAt = { $lt: feedPost.createdAt };
    }

    return this.feedPostModel
      .find({
        $and: [
          { status: 1 },
          { is_deleted: 0 },
          {
            $or: [
              { userId: { $eq: userId } },
              { userId: { $in: friendIds } },
              { rssfeedProviderId: { $in: rssFeedProviderIds } },
            ],
          },
          beforeQuery,
        ],
      })
      .populate('userId', '_id userName profilePic')
      .populate('rssfeedProviderId', '_id title logo')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    // const aggregateQuery = [
    //   {
    //     $lookup:
    //     {
    //       from: 'rssfeedproviderfollows',
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               { userId: { $eq: new mongoose.Types.ObjectId(userId) } },
    //               { status: { $eq: 1 } },
    //             ],
    //           },
    //         },
    //         { $group: { _id: null, rssfeedProviderId: { $addToSet: '$rssfeedProviderId' } } },
    //       ],
    //       as: 'rssFeedProviderFollowsDetails',
    //     },
    //   },
    //   { $unwind: '$rssFeedProviderFollowsDetails' },
    //   {
    //     $lookup: {
    //       from: 'friends',
    //       pipeline: [
    //         {
    //           $match: {
    //             $and: [
    //               {
    //                 $or: [
    //                   { from: { $eq: new mongoose.Types.ObjectId(userId) } },
    //                   { to: { $eq: new mongoose.Types.ObjectId(userId) } },
    //                 ],
    //               },
    //               { reaction: 3 },
    //             ],
    //           },
    //         },
    //         { $group: { _id: null, from: { $addToSet: '$from' }, to: { $addToSet: '$to' } } },
    //         {
    //           $project: {
    //             _id: 0,
    //             ids: { $setUnion: ['$from', '$to'] },
    //           },
    //         },
    //       ],
    //       as: 'friendsDetails',
    //     },
    //   },
    //   { $unwind: '$friendsDetails' },
    //   {
    //     $group:
    //     {
    //       _id: null,
    //       rssfeedProviderIds: { $addToSet: '$rssFeedProviderFollowsDetails.rssfeedProviderId' },
    //       userIds: { $addToSet: '$friendsDetails.ids' },
    //     },
    //   },
    //   { $unwind: '$userIds' },
    //   { $unwind: '$rssfeedProviderIds' },
    // ];
    // const feedPostsData: any = await this.feedPostModel.aggregate(aggregateQuery);
    // const beforeQuery: any = {};
    // if (before) {
    //   const feedPost = await this.feedPostModel.findById(before).exec();
    //   beforeQuery.createdAt = { $lt: feedPost.createdAt };
    // }

    // const feedPostsFindQuery = {
    //   $and: [
    //     {
    //       $or: [
    //         { userId: { $eq: new mongoose.Types.ObjectId(userId) } },
    //         {
    //           userId: {
    //             $in: feedPostsData[0].userIds,
    //           },
    //         },
    //         {
    //           rssfeedProviderId: {
    //             $in: feedPostsData[0].rssfeedProviderIds,
    //           },
    //         },
    //       ],
    //     },
    //     beforeQuery,
    //   ],
    // };
    // return this.feedPostModel
    //   .find(feedPostsFindQuery)
    //   .populate('userId', 'userName _id profilePic')
    //   .sort({ createdAt: -1 })
    //   .limit(limit)
    //   .exec();
  }
}
