import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DisallowedUsername, DisallowedUsernameDocument } from '../../schemas/disallowedUsername/disallowedUsername.schema';

@Injectable()
export class DisallowedUsernameService {
  constructor(@InjectModel(DisallowedUsername.name) private disallowedUsernameModel: Model<DisallowedUsernameDocument>) { }

  async create(disallowedUsername: Partial<DisallowedUsername>) {
    return this.disallowedUsernameModel.create(disallowedUsername);
  }

  async update(id: string, updateDisallowedUsernameJson: Partial<DisallowedUsernameDocument>): Promise<DisallowedUsernameDocument> {
    return this.disallowedUsernameModel
      .findOneAndUpdate({ _id: id }, updateDisallowedUsernameJson, { new: true })
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.disallowedUsernameModel.deleteOne({ _id: id }).exec();
  }

  async findUserName(username: string): Promise<DisallowedUsername> {
    return this.disallowedUsernameModel
    .findOne({ username })
    .collation({ locale: 'en', strength: 2 }) // using case insensitive search index
    .exec();
  }
}
