/* eslint-disable max-lines */
import mongoose, { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as EmailValidator from 'email-validator';
import { isMongoId } from 'class-validator';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { User, UserDocument } from '../../schemas/user/user.schema';
import { escapeStringForRegex } from '../../utils/escape-utils';
import { SocketUser, SocketUserDocument } from '../../schemas/socketUser/socketUser.schema';
import { sleep } from '../../utils/timer-utils';
import { ActiveStatus } from '../../schemas/user/user.enums';
import { NotFoundError } from '../../errors';

export interface UserNameSuggestion {
  userName: string;
  id: mongoose.Schema.Types.ObjectId;
}
@Injectable()
export class UsersService {
  constructor(
    @InjectQueue('delete-user-data') private deleteUserDataQueue: Queue,
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

  async findById(id: string, activeOnly: boolean): Promise<UserDocument> {
    const userFindQuery: any = { _id: id };
    if (activeOnly) {
      userFindQuery.deleted = false;
      userFindQuery.status = ActiveStatus.Active;
    }
    const user = await this.userModel.findOne(userFindQuery).exec();
    return user;
  }

  async findByDeviceId(deviceId: string, userId: string): Promise<UserDocument> {
    return this.userModel.findOne(
      { $and: [{ 'userDevices.device_id': deviceId }, { _id: userId }] },
    ).exec();
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

  async findInactiveUserByEmail(email: string): Promise<UserDocument> {
    return this.userModel
      .findOne({
        email: new RegExp(`^${escapeStringForRegex(email)}$`, 'i'),
        status: ActiveStatus.Inactive,
        deleted: false,
      })
      .exec();
  }

  async findByEmail(email: string, activeOnly: boolean): Promise<UserDocument> {
    const userFindQuery: any = { email: new RegExp(`^${escapeStringForRegex(email)}$`, 'i') };
    if (activeOnly) {
      userFindQuery.deleted = false;
      userFindQuery.status = ActiveStatus.Active;
    }
    return this.userModel
      .findOne(userFindQuery)
      .exec();
  }

  async findByUsername(userName: string, activeOnly: boolean): Promise<UserDocument> {
    const userFindQuery: any = { userName: new RegExp(`^${escapeStringForRegex(userName)}$`, 'i') };
    if (activeOnly) {
      userFindQuery.deleted = false;
      userFindQuery.status = ActiveStatus.Active;
    }
    return this.userModel
      .findOne(userFindQuery)
      .exec();
  }

  async removePreviousUsernameEntry(previousUserName: string): Promise<UserDocument> {
    return this.userModel.findOneAndUpdate(
      { previousUserName },
      { $set: { previousUserName: null } },
      { new: true },
    );
  }

  async findByPreviousUsername(userName: string): Promise<UserDocument> {
    return this.userModel.findOne({ previousUserName: userName }, { userName: 1, previousUserName: 1, _id: 0 }).exec();
  }

  async findNonDeletedUserByEmailOrUsername(emailOrUsername: string): Promise<UserDocument> {
    if (EmailValidator.validate(emailOrUsername)) {
      return this.userModel.findOne({ email: new RegExp(`^${escapeStringForRegex(emailOrUsername)}$`, 'i'), deleted: false }).exec();
    }
    return this.userModel.findOne({ userName: new RegExp(`^${escapeStringForRegex(emailOrUsername)}$`, 'i'), deleted: false }).exec();
  }

  async userNameAvailable(userName: string): Promise<boolean> {
    const users = await this.userModel.find({ userName: new RegExp(`^${escapeStringForRegex(userName)}$`, 'i') }).exec();
    for (const user of users) {
      if (user.userBanned || !user.deleted) { return false; } // username not available if user banned or user not deleted
    }
    return true;
  }

  async emailAvailable(email: string): Promise<boolean> {
    const users = await this.userModel.find({ email: new RegExp(`^${escapeStringForRegex(email)}$`, 'i') }).exec();
    for (const user of users) {
      if (user.userBanned || !user.deleted) { return false; } // email not available if user banned or user not deleted
    }
    return true;
  }

  async resetPasswordTokenIsValid(email: string, resetPasswordToken: string) {
    const isValid = await this.userModel
      .findOne({
        $and: [
          { email: new RegExp(`^${escapeStringForRegex(email)}$`, 'i') },
          { resetPasswordToken },
        ],
      })
      .exec();
    return !!isValid;
  }

  async verificationTokenIsValid(userId: string, token: string) {
    if (!isMongoId(userId)) { return false; }
    const isValid = await this.userModel
      .findOne({
        $and: [
          { _id: new Types.ObjectId(userId) },
          { verification_token: token },
        ],
      })
      .exec();
    return !!isValid;
  }

  async update(id: string, updateUserDto: Partial<UserDocument>): Promise<UserDocument> {
    return this.userModel
      .findOneAndUpdate({ _id: id }, updateUserDto, { new: true })
      .exec();
  }

  async suggestUserName(query: string, limit: number, activeOnly: boolean, excludeUserIds: string[]): Promise<UserNameSuggestion[]> {
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
      .exec();

    const userNameSuggestions: UserNameSuggestion[] = users.map(
      (user) => ({ userName: user.userName, id: user.id, profilePic: user.profilePic }),
    );

    return userNameSuggestions;
  }

  async createSocketUserEntry(socketId: string, userId: string) {
    return this.socketUserModel.create({ userId, socketId });
  }

  async findBySocketId(socketId: string) {
    const socketUser = await this.socketUserModel.findOne({ socketId }).populate('userId').exec();
    return socketUser ? socketUser.userId as UserDocument : null;
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

  async updateNewNotificationCount(id: string): Promise<UserDocument> {
    return this.userModel
      .findOneAndUpdate({ _id: id }, { $inc: { newNotificationCount: 1 } }, { new: true })
      .exec();
  }

  async updateNewFriendRequestCount(id: string): Promise<UserDocument> {
    return this.userModel
      .findOneAndUpdate({ _id: id }, { $inc: { newFriendRequestCount: 1 } }, { new: true })
      .exec();
  }

  async addAndUpdateNewConversationId(id: string, matchId: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ _id: id, newConversationIds: matchId });
    if (!user) {
      const updateUserData = await this.userModel
        .findOneAndUpdate({ _id: id }, { $addToSet: { newConversationIds: matchId } }, { new: true })
        .exec();
      return updateUserData;
    }
    return user;
  }

  async clearNotificationCount(id: string): Promise<UserDocument> {
    return this.userModel
      .findOneAndUpdate({ _id: id }, { $set: { newNotificationCount: 0 } }, { new: true })
      .exec();
  }

  async clearFriendRequestCount(id: string): Promise<UserDocument> {
    return this.userModel
      .findOneAndUpdate({ _id: id }, { $set: { newFriendRequestCount: 0 } }, { new: true })
      .exec();
  }

  async removeAndUpdateNewConversationId(id: string, matchId: string): Promise<UserDocument> {
    const updateUserData = await this.userModel
      .findOneAndUpdate({ _id: id }, { $pull: { newConversationIds: matchId } }, { new: true })
      .exec();
    return updateUserData;
  }

  async clearConverstionIds(id: string): Promise<UserDocument> {
    return this.userModel
      .findOneAndUpdate({ _id: id }, { $set: { newConversationIds: [] } }, { new: true })
      .exec();
  }

  async findOneAndUpdateDeviceToken(id: string, deviceId: string, deviceToken: string): Promise<UserDocument> {
    const user = await this.userModel.findOneAndUpdate(
      { _id: id, 'userDevices.device_id': deviceId },
      { $set: { 'userDevices.$.device_token': deviceToken } },
      { new: true },
    ).exec();
    return user;
  }

  /**
   * Deletes the user with the given id.  This will mark the user db record as deleted
   * and also mark all of the user's content as deleted (including posts and comments).
   * It will also permanently purge certain records from the database (including likes
   * and friend requests).
   * @param userId
   */
  async delete(userId: string) {
    const user = await this.findById(userId, false);
    if (!user) {
      throw new NotFoundError(`Cannot find user with id: ${userId}`);
    }

    await this.deleteUserDataQueue.add('delete-user-all-data', { userId: user.id });
    user.deleted = true;
    user.setUnhashedPassword(uuidv4());
    await user.save();
  }
}
