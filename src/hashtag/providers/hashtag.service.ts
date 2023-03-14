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
    let hastags;
    for (let i = 0; i < name.length; i += 1) {
      hastags = await this.HashtagModel
        .updateOne(
          { name: name[i] },
          { $set: { name: name[i] }, $inc: { totalPost: 1 } },
          { upsert: true, new: true },
        ).exec();
    }
    return hastags;
  }

  async decrementTotalPost(name: string[]) {
    let hastags;
    for (let i = 0; i < name.length; i += 1) {
      hastags = await this.HashtagModel
        .updateOne({ name: name[i] }, { $inc: { totalPost: -1 } }, { new: true })
        .exec();
    }
    return hastags;
  }

  async findHashtags(name: string[]): Promise<Hashtag[]> {
    return this.HashtagModel
      .find({ name: { $in: name } })
      .exec();
  }
}
