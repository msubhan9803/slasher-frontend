import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { UserSettingsService } from '../../settings/providers/user-settings.service';
import { Notification, NotificationDocument } from '../../schemas/notification/notification.schema';
import {
  NOTIFICATION_TYPES_TO_CATEGORIES, NotificationDeletionStatus, NotificationReadStatus, NotificationType,
} from '../../schemas/notification/notification.enums';
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
    private userSettingsService: UserSettingsService,
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
    if (this.configService.get<boolean>('SEND_PUSH_NOTIFICATION')) {
      this.sendPushNotification(notification);
    }

    // Mark notification as processed

    await notification.updateOne({ isProcessed: true });
  }

  async sendPushNotification(notification) {
    // this will remove once old backend retire and update the notificationMsg value in db
    const notificationData = JSON.parse(JSON.stringify(notification));
    const senderName = notificationData.notifyType === NotificationType.NewPostFromFollowedRssFeedProvider
      || ((NotificationType.UserSentYouAFriendRequest || NotificationType.UserAcceptedYourFriendRequest)
        && notificationData?.senderId?.userName === 'Slasher')
      ? '' : `${notificationData.senderId?.userName} `;
    notificationData.notificationMsg = senderName + notificationData.notificationMsg;
    const [user, userSetting] = await Promise.all([this.usersService.findById(notificationData.userId.toString(), true),
    this.userSettingsService.findByUserId(notificationData.userId.toString())]);
    const isNotificationEnabled = userSetting && userSetting[`${NOTIFICATION_TYPES_TO_CATEGORIES.get(notificationData.notifyType)}`];
    if (isNotificationEnabled && user.userDevices?.length) {
      const deviceTokens = user.userDevices.filter((device) => device.device_id !== 'browser' && device.device_token)
      .map((device) => device.device_token);
      this.pushNotificationsService.sendPushNotification(notificationData, deviceTokens, user.newNotificationCount);
    }
  }

  async sendChatMsgPushNotification(matchId, receiverUser, senderUser) {
    const notificationData:any = {};
    notificationData.notificationMsg = `${senderUser.userName} sent you a message`;
    notificationData.matchId = matchId;
    notificationData.notifyType = NotificationType.FriendMessageNotification;
    const userSetting = await this.userSettingsService.findByUserId(receiverUser.id.toString());
    const isNotificationEnabled = userSetting && userSetting[`${NOTIFICATION_TYPES_TO_CATEGORIES.get(126)}`];
    if (isNotificationEnabled && receiverUser.userDevices?.length) {
      const deviceTokens = receiverUser.userDevices.filter((device) => device.device_id !== 'browser' && device.device_token)
      .map((device) => device.device_token);
      await this.pushNotificationsService.sendPushNotification(notificationData, deviceTokens, receiverUser.newNotificationCount);
    }
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
