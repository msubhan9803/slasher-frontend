import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from '../../schemas/notification/notification.schema';
import { NotificationDeletionStatus, NotificationReadStatus } from '../../schemas/notification/notification.enums';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) { }

  async create(notification: Partial<Notification>) {
    return this.notificationModel.create(notification);
  }

  async findAllByUser(userId: string, limit: number, before?: string): Promise<NotificationDocument[]> {
    let beforeCreatedAt;
    if (before) {
      const beforeNotification = await this.notificationModel.findById(before).exec();
      beforeCreatedAt = { $lt: beforeNotification.createdAt };
    }
    const notification = await this.notificationModel
      .find({
        $and: [
          {
            userId,
            is_deleted: NotificationDeletionStatus.NotDeleted,
          },
          before ? { createdAt: beforeCreatedAt } : {},
        ],
      })
      .populate('senderId', 'userName _id profilePic')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return notification;
  }

  async findById(id: string): Promise<NotificationDocument> {
    return this.notificationModel.findById(id).exec();
  }

  async update(id: string, notificationData: Partial<NotificationDocument>): Promise<NotificationDocument> {
    return this.notificationModel
      .findOneAndUpdate({ _id: id }, notificationData, { new: true })
      .exec();
  }

  async markAllAsReadForUser(userId: string) {
    return this.notificationModel
      .updateMany({ userId }, { isRead: NotificationReadStatus.Read })
      .exec();
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const friendsCount = await this.notificationModel
      .find({
        $and: [{
          userId: new mongoose.Types.ObjectId(userId),
          isRead: NotificationReadStatus.Unread,
          is_deleted: NotificationDeletionStatus.NotDeleted,
        }],
      })
      .count()
      .exec();
    return friendsCount;
  }

  async cleanupNotifications(LIMIT_LATEST = 80) {
    try {
      const nots: any = await this.notificationModel.aggregate([
        { $sort: { createdAt: -1 } }, // latest date first
        {
          $group: {
            _id: '$userId',
            notifications: { $push: '$$ROOT' },
          },
        },
        {
          $project: {
            notifications: { $slice: ['$notifications', LIMIT_LATEST] }, // return first 80
          },
        },
      ]);
      // eslint-disable-next-line no-console
      // console.log(nots.map((n: any) => n.notifications.map((nf) => nf.createdAt)));

      // For each group of notifications, use the deleteMany() method to delete all the notifications except the latest 80
      // for (const n of nots) {
      //   await this.notificationModel.deleteMany({
      //     userId: n._id,
      //     _id: { $nin: n.notifications.map((doc) => doc._id) },
      //   });
      // }

      // Delete at once
      const requiredIds = nots.map((n) => n.notifications.map((doc) => doc._id.toString())).flatMap((a) => a);
      await this.notificationModel.deleteMany({
        _id: { $nin: requiredIds },
      });

      return {
        success: true,
        message: 'Successfully completed the cron job',
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

  async insertMany(notifications: Array<Partial<Notification>>) {
    return this.notificationModel.insertMany(notifications);
  }

  async estimatedDocumentCount() {
    return this.notificationModel.estimatedDocumentCount();
  }

  async deleteMany(...args) {
    return this.notificationModel.deleteMany(...args);
  }

  async aggregate(...args) {
    return this.notificationModel.aggregate(...args);
  }

  async _find(...args) {
    return this.notificationModel.find(...args);
  }
}
