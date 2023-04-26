import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HashTagsFollow, HashTagsFollowDocument } from '../../schemas/hashtagFollow/hashtagFollows.schema';

@Injectable()
export class HashtagFollowsService {
  constructor(@InjectModel(HashTagsFollow.name) private hashtagFollowModel: Model<HashTagsFollowDocument>) { }

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
      .find({ userId })
      .populate('hashTagId', 'name totalPost')
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
}
