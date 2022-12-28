import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as EmailValidator from 'email-validator';
import { User, UserDocument } from '../../schemas/user/user.schema';
import { escapeStringForRegex } from '../../utils/escape-utils';
import { SocketUser, SocketUserDocument } from '../../schemas/socketUser/socketUser.schema';
import { sleep } from '../../utils/timer-utils';
import { ActiveStatus } from '../../schemas/user/user.enums';

export interface UserNameSuggestion {
  userName: string;
  id: mongoose.Schema.Types.ObjectId;
}
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(SocketUser.name) private socketUserModel: Model<SocketUserDocument>,
  ) { }

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

  /**
   * For the given array of user ids, returns true if they are ALL existing, active users.
   * @param participants
   */
  async usersExistAndAreActive(userIds: mongoose.Types.ObjectId[]) {
    return (await this.userModel.find({
      _id: { $in: userIds },
      deleted: false,
      status: ActiveStatus.Active,
    }).count()) === userIds.length;
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

  async update(id: string, updateUserDto: Partial<UserDocument>): Promise<UserDocument> {
    return this.userModel
      .findOneAndUpdate({ _id: id }, updateUserDto, { new: true })
      .exec();
  }

  async suggestUserName(query: string, limit: number, activeOnly: boolean, excludeUserIds: User[]): Promise<UserNameSuggestion[]> {
    const nameFindQuery: any = {
      userName: new RegExp(`^${escapeStringForRegex(query)}`, 'i'),
      _id: { $nin: excludeUserIds },
    };
    if (activeOnly) {
      nameFindQuery.deleted = false;
      nameFindQuery.status = ActiveStatus.Active;
    }
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

  async createSocketUserEntry(socketId: string, userId: string) {
    return this.socketUserModel.create({ userId, socketId });
  }

  async findBySocketId(socketId: string) {
    const socketUser = await this.socketUserModel.findOne({ socketId }).populate('userId').exec();
    return socketUser ? socketUser.userId : null;
  }

  async findSocketIdsForUser(userId: string) {
    return (await this.socketUserModel.find({ userId }).select('socketId').exec()).map((socketUser) => socketUser.socketId);
  }

  async deleteSocketUserEntry(socketId: string) {
    for (let i = 0; i < 3; i += 1) {
      const deletionResult = await this.socketUserModel.deleteOne({ socketId });

      // Sometimes, if a user disconnects too soon after connecting, the SocketUser entry isn't
      // available. To account for this, if the deletion result is 0, we'll wait 1 seconds and then
      // attempt the deletion again.  This is important for proper SocketUsers entry cleanup.
      if (deletionResult.deletedCount === 1) { break; }
      await sleep(1000);
    }
  }

  async getSocketUserCount(): Promise<number> {
    return this.socketUserModel.countDocuments();
  }
}
