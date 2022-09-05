import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
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
    return this.userModel
      .findOne({ email: email })
      .collation({ locale: 'en', strength: 2 }) // using case insensitive search index
      .exec();
  }

  async findByUsername(userName: string): Promise<UserDocument> {
    return this.userModel
      .findOne({ userName: userName })
      .collation({ locale: 'en', strength: 2 }) // using case insensitive search index
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
