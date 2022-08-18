import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Notification,
  NotificationDocument,
} from '../schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

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
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();
  }
}
