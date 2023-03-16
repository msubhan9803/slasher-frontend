import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { escapeStringForRegex } from '../../utils/escape-utils';
import { Hashtag, HashtagDocument } from '../../schemas/hastag/hashtag.schema';
import { HashtagActiveStatus, HashtagDeletionStatus } from '../../schemas/hastag/hashtag.enums';

@Injectable()
export class HashtagService {
  constructor(
    @InjectModel(Hashtag.name) private HashtagModel: Model<HashtagDocument>,
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

  async suggestHashtagName(query: string, limit: number, activeOnly: boolean): Promise<Hashtag[]> {
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
}
