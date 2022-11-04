import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserSetting, UserSettingDocument } from '../../schemas/userSetting/userSetting.schema';

@Injectable()
export class UserSettingsService {
  constructor(@InjectModel(UserSetting.name) private UserSettingModel: Model<UserSettingDocument>) { }

  async create(userSettingData: Partial<UserSetting>) {
    return this.UserSettingModel.create(userSettingData);
  }

  async update(id: string, UserSettingData: Partial<UserSettingDocument>): Promise<UserSettingDocument> {
    return this.UserSettingModel
      .findOneAndUpdate({ userId: id }, UserSettingData, { new: true })
      .exec();
  }

  async findByUserId(userId: string): Promise<UserSettingDocument> {
    return this.UserSettingModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).exec();
  }
}
