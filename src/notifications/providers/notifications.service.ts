import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';
import { Notification, NotificationDocument } from '../../schemas/notification/notification.schema';
import { NotificationDeletionStatus, NotificationReadStatus, NotificationType } from '../../schemas/notification/notification.enums';
import { NotificationsGateway } from './notifications.gateway';
import { UsersService } from '../../users/providers/users.service';
import { PushNotificationsService } from './push-notifications.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private notificationsGateway: NotificationsGateway,
    private pushNotificationsService: PushNotificationsService,
    private configService: ConfigService,
    private readonly usersService: UsersService,
  ) { }

  async create(notification: Partial<Notification>) {
    const newNotification = await this.notificationModel.create(notification);
    // TODO: Eventually move this to a background job (probably using a NestJS Queue: https://docs.nestjs.com/techniques/queues)
    // This can be processed in the background instead of adding a small delay to each notification creation.
    await Promise.all([this.processNotification(newNotification.id),
    this.usersService.updateNewNotificationCount((notification.userId).toString())]);
    return newNotification;
  }

  async processNotification(notificationId: string) {
    const notification = await this.findById(notificationId);

    // If the notification is already marked as processed, then there's nothing to do here
    if (notification.isProcessed) { return; }

    // In SD-661, confirmed that all notifications should be emitted over socket.
    this.notificationsGateway.emitMessageForNotification(notification);

    // UserSettings determine whether push notifications should ALSO be sent.  The new API
    // app doesn't currently support push notifications because it's only supporting a web app
    // at this time, so the lines below are just placeholder code for later:

    // const userSettings = await this.userSettingsService.findByUserId((notification.userId as mongoose.Types.ObjectId).toString());
    // if (userSettings.notificationTypeEnabled(notification.notifyType)) {
    //   // Emit notification if user has this notification type enabled
    //   // TODO: Send push notification
    // }

    const user = await this.usersService.findById(notification.userId.toString(), true);
    if (user.userDevices.length) {
      let deviceToken = user.userDevices.map(
        (device) => {
          if (device.device_id !== 'browser' &&  device.device_id !== 'sample-device-id') {
            return device.device_token;
          }
        },
      );
      deviceToken = deviceToken.filter(Boolean);
      if (this.configService.get<boolean>('SEND_PUSH_NOTIFICATION')) {
        await this.pushNotificationsService.sendPushNotification(notification, deviceToken);
      }
    }
    // Mark notification as processed
    await notification.updateOne({ isProcessed: true });
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
            notifyType: {
              $nin: [
                // Ignoring these in the new app because they're associated with
                // comments from the old API structure, which is incompatible with
                // the new structure (and Damon knows about this problem).
                NotificationType.UserMentionedYouInACommentOnANewsPost,
                NotificationType.UserLikedYourCommentOnANewsPost,
              ],
            },
          },
          before ? { createdAt: beforeCreatedAt } : {},
        ],
      })
      .populate('senderId', 'userName _id profilePic')
      .populate('feedPostId', '_id userId postType movieId')
      .populate('rssFeedProviderId', '_id logo title')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return notification;
  }

  async findById(id: string): Promise<NotificationDocument> {
    return this.notificationModel
      .findById(id)
      .populate('senderId', 'userName _id profilePic')
      .populate('feedPostId', '_id userId postType movieId')
      .populate('rssFeedProviderId', '_id logo title')
      .exec();
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

  /**
   * Returns true if a similar recent notification is found.  Otherwise returns false.
   * @param userId
   * @param senderId
   * @param notifyType
   * @returns
   */
  async similarRecentNotificationExists(userId: string, senderId: string, notifyType: number): Promise<boolean> {
    const result = await this.notificationModel.exists({
      userId: new mongoose.Types.ObjectId(userId),
      senderId,
      notifyType,
      createdAt: { $lte: DateTime.now().toJSDate(), $gte: DateTime.now().minus({ days: 7 }).toJSDate() },
    });

    return !!result;
  }

  /**
   * Deletes all notifications created before the given beforeDate.
   * @param beforeDate
   * @returns An object that contains information about success or failure.
   */
  async cleanupNotifications(beforeDate: Date) {
    try {
      await this.notificationModel.deleteMany({ createdAt: { $lt: beforeDate } });
      return {
        success: true,
        message: 'Successfully completed the cleanupNotifications cron job',
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }
}
