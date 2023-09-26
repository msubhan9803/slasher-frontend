import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserFollow, UserFollowDocument } from '../../schemas/userFollow/userFollow.schema';

@Injectable()
export class UserFollowService {
    constructor(
        @InjectModel(UserFollow.name) private userFollowModel: Model<UserFollowDocument>,
    ) { }

    async createOrUpdate(userId: string, followUserId: string, notification: boolean): Promise<UserFollowDocument> {
        const existingData = await this.userFollowModel.findOne({ userId, followUserId });

        if (existingData) {
            existingData.pushNotifications = notification;
            existingData.save();
            return existingData;
        }

        return this.userFollowModel.create({
            userId,
            followUserId,
            pushNotifications: notification,
        });
    }

    async findFollowUserData(userId: string, followUserId: string): Promise<UserFollowDocument> {
        return this.userFollowModel.findOne({
            $and: [
                { userId },
                { followUserId },
            ],
        });
    }

    async findAllFollowUser(id: string, limit:number, offset?:number): Promise<UserFollowDocument[]> {
        return this.userFollowModel.find({ userId: id })
            .populate('followUserId', '_id userName profilePic firstName')
            .limit(limit)
            .skip(offset)
            .exec();
    }

    async delete(id: string): Promise<any> {
        await this.userFollowModel.deleteOne({ _id: id }).exec();
    }

    async findAllUsersForFollowNotification(id: string): Promise<UserFollowDocument[]> {
        return this.userFollowModel.find({ followUserId: id }, { userId: 1, _id: 0 }).exec();
    }

    async deleteFollowDataOnUnfriend(fromUserId: string, toUserId: string): Promise<void> {
        await this.userFollowModel.deleteMany({
            $or: [
                { userId: fromUserId, followUserId: toUserId },
                { userId: toUserId, followUserId: fromUserId },
            ],
        }).exec();
    }
}
