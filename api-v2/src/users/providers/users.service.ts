import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { escapeStringRegexp } from '../../utils/escape-utils';
import * as EmailValidator from 'email-validator';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
    const emailEscapedForRegexp = escapeStringRegexp(email);

    return this.userModel
      .findOne({ email: new RegExp(`^${emailEscapedForRegexp}$`, 'i') }) // case insensitive search
      .exec();
  }

  async findByUsername(username: string): Promise<UserDocument> {
    const usernameEscapedForRegexp = escapeStringRegexp(username);

    return this.userModel
      .findOne({ userName: new RegExp(`^${usernameEscapedForRegexp}$`, 'i') }) // case insensitive search
      .exec();
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<UserDocument> {
    if (EmailValidator.validate(emailOrUsername)) {
      return this.findByEmail(emailOrUsername);
    } else {
      return this.findByUsername(emailOrUsername);
    }
  }
}
