import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as EmailValidator from 'email-validator';
import { User, UserDocument } from '../../schemas/user/user.schema';
import { escapeStringForRegex } from '../../utils/escape-utils';

export interface UserNameSuggestion {
  userName: string;
  id: mongoose.Schema.Types.ObjectId;
}
@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async create(user: Partial<User>) {
    return this.userModel.create(user);
  }

  async findAll(page: number, perPage: number): Promise<UserDocument[]> {
    return this.userModel
      .find({})
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
  }

  async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel
      .findOne({ email })
      .collation({ locale: 'en', strength: 2 }) // using case insensitive search index
      .exec();
  }

  async findByUsername(userName: string): Promise<UserDocument> {
    return this.userModel
      .findOne({ userName })
      .collation({ locale: 'en', strength: 2 }) // using case insensitive search index
      .exec();
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<UserDocument> {
    if (EmailValidator.validate(emailOrUsername)) {
      return this.findByEmail(emailOrUsername);
    }
    return this.findByUsername(emailOrUsername);
  }

  async userNameExists(userName: string): Promise<boolean> {
    return (
      (await this.userModel
        .findOne({ userName })
        .collation({ locale: 'en', strength: 2 }) // using case insensitive search index
        .count()
        .exec()) > 0
    );
  }

  async emailExists(email: string): Promise<boolean> {
    return (
      (await this.userModel
        .findOne({ email })
        .collation({ locale: 'en', strength: 2 }) // using case insensitive search index
        .count()
        .exec()) > 0
    );
  }

  async resetPasswordTokenIsValid(email: string, resetPasswordToken: string) {
    const isValid = await this.userModel
      .findOne({
        $and: [{ email }, { resetPasswordToken }],
      })
      .collation({ locale: 'en', strength: 2 }) // using case insensitive search index
      .exec();
    return !!isValid;
  }

  async verificationTokenIsValid(email: string, verification_token: string) {
    const isValid = await this.userModel
      .findOne({
        $and: [{ email }, { verification_token }],
      })
      .collation({ locale: 'en', strength: 2 }) // using case insensitive search index
      .exec();
    return !!isValid;
  }

  async getSuggestedFriends(user: UserDocument, limit: number) {
    return this.userModel
      .find({ _id: { $ne: user._id } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async update(id: string, updateUserDto: Partial<UserDocument>): Promise<UserDocument> {
    return this.userModel
      .findOneAndUpdate({ _id: id }, updateUserDto, { new: true })
      .exec();
  }

  async suggestUserName(query: string, limit: number): Promise<UserNameSuggestion[]> {
    const nameFindQuery = { userName: new RegExp(`^${escapeStringForRegex(query)}`) };
    const users = await this.userModel
      .find(nameFindQuery)
      .sort({ userName: 1 })
      .limit(limit)
      .collation({ locale: 'en', strength: 2 })
      .exec();

    const userNameSuggestions: UserNameSuggestion[] = users.map(
      (user) => ({ userName: user.userName, id: user.id }),
    );

    return userNameSuggestions;
  }
}
