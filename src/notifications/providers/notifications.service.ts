import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from '../../schemas/notification/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) { }

  async create(notification: Partial<Notification>) {
    return this.notificationModel.create(notification);
  }

  /**
   * Returns a user's notifications, sorted from most recent to least recent.
   * @param userId
   * @returns
   */
  async findAllByUserId(
    userId: string,
    page = 1,
    perPage = 10,
  ): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
  }
}
