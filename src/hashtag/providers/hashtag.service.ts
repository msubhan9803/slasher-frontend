/* eslint-disable class-methods-use-this */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { DateTime } from 'luxon';
import { count } from 'rxjs';
import { escapeStringForRegex } from '../../utils/escape-utils';
import { Hashtag, HashtagDocument } from '../../schemas/hastag/hashtag.schema';
import { HashtagActiveStatus, HashtagDeletionStatus } from '../../schemas/hastag/hashtag.enums';
import { FeedPostsService } from '../../feed-posts/providers/feed-posts.service';
import { toUtcStartOfDay } from '../../utils/date-utils';
import { HashtagsSortByType } from '../../types';
import { NON_ALPHANUMERIC_REGEX } from '../../constants';

@Injectable()
export class HashtagService {
  constructor(
    @InjectModel(Hashtag.name) private HashtagModel: Model<HashtagDocument>,
    private readonly feedPostsService: FeedPostsService,
  ) { }

  async createOrUpdateHashtags(name: string[]) {
    const hastags = [];
    for (let i = 0; i < name.length; i += 1) {
      hastags.push(await this.HashtagModel
        .findOneAndUpdate(
          { name: name[i] },
          { $set: { name: name[i] }, $inc: { totalPost: 1 } },
          { upsert: true, new: true },
        ).exec());
    }
    return hastags;
  }

  async decrementTotalPost(name: string[]) {
    const hastags = [];
    for (let i = 0; i < name.length; i += 1) {
      hastags.push(await this.HashtagModel
        .findOneAndUpdate({ name: name[i] }, { $inc: { totalPost: -1 } }, { new: true })
        .exec());
    }
    return hastags;
  }

  async suggestHashtagName(query: string, limit: number, activeOnly: boolean, offset?: number): Promise<Hashtag[]> {
    const nameFindQuery: any = {
      name: new RegExp(`^${escapeStringForRegex(query)}`, 'i'),
    };
    if (activeOnly) {
      nameFindQuery.deleted = false;
      nameFindQuery.status = HashtagActiveStatus.Active;
    }
    const hashtags = await this.HashtagModel
      .find(nameFindQuery)
      .sort({ name: 1 })
      .skip(offset)
      .limit(limit)
      .collation({ locale: 'en', strength: 2 })
      .exec();

    const hashtagsNameSuggestions = hashtags.map(
      (hashtag) => ({ name: hashtag.name, _id: hashtag.id, totalPost: hashtag.totalPost }),
    );
    return hashtagsNameSuggestions as unknown as Hashtag[];
  }

  async findByHashTagName(name: string, activeOnly: boolean): Promise<Hashtag> {
    const hashtagFindQuery: any = { name };
    if (activeOnly) {
      hashtagFindQuery.deleted = HashtagDeletionStatus.NotDeleted;
      hashtagFindQuery.status = HashtagActiveStatus.Active;
    }
    return this.HashtagModel.findOne(hashtagFindQuery).exec();
  }

  async findAllHashTagName(name: string[]): Promise<Hashtag[]> {
    return this.HashtagModel
      .find({
        $and: [
          { name: { $in: name } },
          { is_deleted: 0, status: 1 },
        ],
      }, { name: 1 })
      .exec();
  }

  async findAllHashtags(name: string[], limit: number): Promise<Hashtag[]> {
    return this.HashtagModel
      .find({
        $and: [
          { name: { $nin: name } },
          { is_deleted: 0, status: 1 },
        ],
      }, { name: 1, totalPost: 1 })
      .sort({ totalPost: -1 })
      .limit(limit)
      .exec();
  }

  async findAllHashtagById(hashtagId: Hashtag[], limit: number, query?: string, offset?: number): Promise<Hashtag[]> {
    const name = query ? { name: new RegExp(`^${escapeStringForRegex(query)}`, 'i') } : {};
    return this.HashtagModel.find(
      {
        $and: [{ _id: { $in: hashtagId } },
        name,
        { deleted: 0, status: 1 }],
      },
      {
        name: 1, totalPost: 1, _id: 1,
      },
    ).skip(offset).limit(limit).exec();
  }

  async hashtagOnboardingSuggestions() {
    const fourteenDaysAgo = toUtcStartOfDay(DateTime.now().minus({ days: 14 }).toJSDate());
    const oneDayAgo = toUtcStartOfDay(DateTime.now().minus({ days: 1 }).toJSDate());
    const [fourteenDaysAgoPosts, oneDayAgoPosts] = await Promise.all(
      [this.feedPostsService.findPostsByDays(fourteenDaysAgo), this.feedPostsService.findPostsByDays(oneDayAgo)],
    );

    let hashtags = await this.sortedHashtags(fourteenDaysAgoPosts);
    const hashtags24Hours = await this.sortedHashtags(oneDayAgoPosts);
    const removedItems = hashtags.filter((item) => !hashtags24Hours.includes(item));
    //filter unique hashtags from hashtags24Hours
    hashtags = hashtags.filter((value) => hashtags24Hours.includes(value));

    if (hashtags.length >= 16) {
      return hashtags.slice(0, 16);
    }
    hashtags = hashtags.concat(removedItems.slice(0, 16 - hashtags.length));
    if (hashtags.length >= 16) {
      return hashtags;
    }
    const hashtagData = (await this.findAllHashtags(hashtags, 16 - hashtags.length)).map((names) => names.name);
    hashtags = hashtags.concat(hashtagData);
    return hashtags;
  }

  async sortedHashtags(hashtags) {
    const hashtagCount = {};
    hashtags.forEach((element) => {
      hashtagCount[element] = (hashtagCount[element] || 0) + 1;
    });
    const sortHashtagsKeys = Object.entries(hashtagCount)
      .sort((a, b) => (b as any)[1] - (a as any)[1]) // sort by value
      .map(([key]) => key); // get the keys
    return sortHashtagsKeys;
  }

  async updateHashtagStatus(hashtagId: string, status: HashtagActiveStatus) {
    const hashtag = (await this.HashtagModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(hashtagId) },
      { status },
      { upsert: false, new: true },
    )).toObject();
    return hashtag;
  }

  async hashtagExists(hashtagId: string): Promise<boolean> {
    const exists = await this.HashtagModel.exists({ _id: new mongoose.Types.ObjectId(hashtagId) });
    return Boolean(exists);
  }

  async findAll(
    limit: number,
    activeOnly: boolean,
    sortBy: HashtagsSortByType,
    after?: mongoose.Types.ObjectId,
    nameContains?: string,
    sortNameStartsWith?: string,
  ): Promise<{ allItemsCount: number, items: HashtagDocument[] }> {
    const hashtagFindAllQuery: any = {};
    if (activeOnly) {
      hashtagFindAllQuery.status = HashtagActiveStatus.Active;
    }

    if (nameContains || sortNameStartsWith) {
      hashtagFindAllQuery.name = {};
    }

    if (nameContains) {
      hashtagFindAllQuery.name.$regex = new RegExp(`^${escapeStringForRegex(nameContains)}`, 'i');
    }
    if (sortNameStartsWith) {
      if (sortNameStartsWith !== '#') {
        hashtagFindAllQuery.name.$regex = new RegExp(`^${escapeStringForRegex(sortNameStartsWith.toLowerCase())}`);
      } else {
        hashtagFindAllQuery.name.$regex = new RegExp(NON_ALPHANUMERIC_REGEX, 'i');
      }
    }

    const allItemsCount = await this.HashtagModel.count(hashtagFindAllQuery);

    if (after) {
      const afterHashtag = await this.HashtagModel.findById(after);
      hashtagFindAllQuery[sortBy] = { $gt: afterHashtag[sortBy] };
    }

    const sortByFields: any = {};
    // TODO: Add `aesc` and `desc` params if we need reverse sorting and according set 1 or -1 value
    sortByFields[sortBy] = 1;

    const items = await this.HashtagModel.find(hashtagFindAllQuery)
      .sort(sortByFields)
      .limit(limit)
      .exec();

    return { allItemsCount, items };
  }
}
