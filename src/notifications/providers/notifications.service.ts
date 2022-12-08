import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from '../../schemas/notification/notification.schema';
import { NotificationDeletionStatus, NotificationReadStatus, NotificationStatus } from '../../schemas/notification/notification.enums';

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
            status: NotificationStatus.Active,
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
}
