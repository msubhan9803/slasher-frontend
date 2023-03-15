import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hashtag, HashtagDocument } from '../../schemas/hastag/hashtag.schema';

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
}
