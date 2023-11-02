/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { DateTime } from 'luxon';
import { AppModule } from '../../app.module';
import { NotificationsService } from './notifications.service';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { UsersService } from '../../users/providers/users.service';
import { FeedPostsService } from '../../feed-posts/providers/feed-posts.service';
import { UserDocument } from '../../schemas/user/user.schema';
import { userFactory } from '../../../test/factories/user.factory';
import {
  NotificationType, NotificationDeletionStatus, NotificationReadStatus,
} from '../../schemas/notification/notification.enums';
import { feedPostFactory } from '../../../test/factories/feed-post.factory';
import { FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';

import { notificationFactory } from '../../../test/factories/notification.factory';
import { Notification, NotificationDocument } from '../../schemas/notification/notification.schema';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { UserSettingsService } from '../../settings/providers/user-settings.service';
import { userSettingFactory } from '../../../test/factories/user-setting.factory';
import { PushNotificationsService } from './push-notifications.service';
import { Message } from '../../schemas/message/message.schema';
import { ChatService } from '../../chat/providers/chat.service';

describe('NotificationsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let notificationsService: NotificationsService;
  let feedPostsService: FeedPostsService;
  let usersService: UsersService;
  let userSettingsService: UserSettingsService;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
  let feedPostData: FeedPostDocument;
  let pushNotificationsService: PushNotificationsService;
  let notificationModel: Model<NotificationDocument>;
  let chatService: ChatService;

  const deviceAndAppVersionPlaceholderSignInFields = {
    device_id: 'sample-device-id-1',
    device_token: 'sample',
    device_type: 'sample-device-type',
    device_version: 'sample-device-version',
    app_version: 'sample-app-version',
    login_date: Date.now(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    userSettingsService = moduleRef.get<UserSettingsService>(UserSettingsService);
    pushNotificationsService = moduleRef.get<PushNotificationsService>(PushNotificationsService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    chatService = moduleRef.get<ChatService>(ChatService);
    notificationModel = moduleRef.get<Model<NotificationDocument>>(getModelToken(Notification.name));
    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
    activeUser = await usersService.create(userFactory.build());
    await userSettingsService.create(
      userSettingFactory.build(
        {
          userId: activeUser._id,
        },
      ),
    );
    user1 = await usersService.create(userFactory.build());
    await userSettingsService.create(
      userSettingFactory.build(
        {
          userId: activeUser._id,
        },
      ),
    );
    feedPostData = await feedPostsService.create(feedPostFactory.build({
      userId: activeUser.id,
    }));
  });

  it('should be defined', () => {
    expect(notificationsService).toBeDefined();
    expect(feedPostsService).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('#create', () => {
    it('creates the expected notification record', async () => {
      const notificationObj: any = {
        userId: activeUser.id,
        feedPostId: feedPostData.id,
        senderId: user1.id,
        allUsers: [user1._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserMentionedYouInPost,
        notificationMsg: 'had mentioned you in a post',
      };
      const notificationData = await notificationsService.create(notificationObj);
      expect(notificationData.userId.toString()).toBe(activeUser.id);
    });
  });

  describe('#sendChatMsgPushNotification', () => {
    let message: Message;
    it('should send chat message push notification', async () => {
      jest.spyOn(pushNotificationsService, 'sendPushNotification').mockImplementation(() => Promise.resolve());
      const userDevices = [];
      const weekAgo = DateTime.now().minus({ days: 8 }).toISODate();
      userDevices.push(
        {
          ...deviceAndAppVersionPlaceholderSignInFields,
          login_date: weekAgo,
        },
      );
      const userData = userFactory.build({
        newNotificationCount: 1,
      });
      userData.userDevices = userDevices;
      user2 = await usersService.create(userData);
      await userSettingsService.create(userSettingFactory.build({
        userId: user2.id,
      }));

      message = await chatService.sendPrivateDirectMessage(user1.id, user2.id, 'Hi, test message.');
      await notificationsService.sendChatMsgPushNotification(message.matchId, user2, user1);
      jest.spyOn(userSettingsService, 'findByUserId').mockResolvedValue(user2.id.toString());
      expect(pushNotificationsService.sendPushNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          notificationMsg: `${user1.userName} sent you a message`,
          matchId: message.matchId,
          notifyType: NotificationType.FriendMessageNotification,
        }),
        ['sample'],
        1,
      );
    });
  });

  describe('#findAllByUser', () => {
    beforeEach(async () => {
      for (let index = 0; index < 5; index += 1) {
        await notificationsService.create(
          notificationFactory.build({
            userId: activeUser.id,
            is_deleted: NotificationDeletionStatus.NotDeleted,
            senderId: user1.id,
            allUsers: [user1._id as any], // senderId must be in allUsers for old API compatibility
          }),
        );
      }
    });

    it('finds all the expected notifications details', async () => {
      const allNotifications = await notificationsService.findAllByUser(activeUser.id, 20);
      for (let index = 1; index < allNotifications.length; index += 1) {
        expect(allNotifications[index - 1].createdAt > allNotifications[index].createdAt).toBe(true);
      }
      expect(allNotifications).toHaveLength(5);
    });

    describe('when `before` argument is supplied', () => {
      it('returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResults = await notificationsService.findAllByUser(activeUser.id, limit);
        expect(firstResults).toHaveLength(3);
        const secondResults = await notificationsService.findAllByUser(activeUser.id, limit, firstResults[limit - 1]._id.toString());
        expect(secondResults).toHaveLength(2);
      });
    });
  });

  describe('#findById', () => {
    let notification;
    beforeEach(async () => {
      notification = await notificationsService.create(
        notificationFactory.build(
          {
            userId: activeUser.id,
          },
        ),
      );
    });
    it('finds the expected notification details', async () => {
      const notificationDetails = await notificationsService.findById(notification._id);
      expect(notificationDetails.notificationMsg).toEqual(notification.notificationMsg);
    });
  });

  describe('#deleteAllNotificationByUserId', () => {
    let user3;
    let user4;
    let user5;
    let notification1;
    let notification2;
    beforeEach(async () => {
      user3 = await usersService.create(userFactory.build());
      user4 = await usersService.create(userFactory.build());
      user5 = await usersService.create(userFactory.build());
      notification1 = await notificationsService.create(
        notificationFactory.build(
          {
            userId: user3.id,
            senderId: user5.id,
          },
        ),
      );
      notification2 = await notificationsService.create(
        notificationFactory.build(
          {
            userId: user4.id,
            senderId: user5.id,
          },
        ),
      );
    });
    it('deletes all notification by userId', async () => {
      await notificationsService.deleteAllNotificationByUserId(user5.id);
      expect((await notificationsService.findById(notification1.id)).is_deleted).toBe(NotificationDeletionStatus.Deleted);
      expect((await notificationsService.findById(notification2.id)).is_deleted).toBe(NotificationDeletionStatus.Deleted);
    });
  });

  describe('#update', () => {
    let notification;
    beforeEach(async () => {
      notification = await notificationsService.create(
        notificationFactory.build(
          {
            userId: activeUser.id,
          },
        ),
      );
    });
    it('finds the expected notification and update the details', async () => {
      const notificationData = {
        notificationMsg: 'notification test message',
      };
      const updatedNotification = await notificationsService.update(notification._id, notificationData);
      const reloadedNotification = await notificationsService.findById(updatedNotification.id);
      expect(reloadedNotification.notificationMsg).toEqual(notificationData.notificationMsg);
    });
  });

  describe('#markAllAsReadForUser', () => {
    beforeEach(async () => {
      for (let index = 0; index < 5; index += 1) {
        await notificationsService.create(
          notificationFactory.build({
            userId: activeUser.id,
            is_deleted: NotificationDeletionStatus.NotDeleted,
            isRead: NotificationReadStatus.Unread,
          }),
        );
      }
    });

    it('finds all the expected notifications details and mark all as read for users', async () => {
      await notificationsService.markAllAsReadForUser(activeUser.id);
      const getAllReadNotifications = await notificationsService.findAllByUser(activeUser.id, 15);
      for (const read of getAllReadNotifications) {
        expect(read.isRead).toEqual(NotificationReadStatus.Read);
      }
    });
  });

  describe('#getUnreadNotificationCount', () => {
    beforeEach(async () => {
      for (let index = 0; index < 5; index += 1) {
        await notificationsService.create(
          notificationFactory.build({
            userId: activeUser.id,
            is_deleted: NotificationDeletionStatus.NotDeleted,
            isRead: NotificationReadStatus.Unread,
          }),
        );
      }
      await notificationsService.create(
        notificationFactory.build({
          userId: activeUser.id,
          is_deleted: NotificationDeletionStatus.Deleted,
          isRead: NotificationReadStatus.Unread,
        }),
      );
    });

    it('finds all the expected notifications count', async () => {
      const getAllReadNotificationsCount = await notificationsService.getUnreadNotificationCount(activeUser.id);
      expect(getAllReadNotificationsCount).toBe(5);
    });
  });

  describe('#cleanupNotifications', () => {
    let DAYS;
    let DAYS_NOTIFICATIONS_KEPT;

    beforeEach(async () => {
      const today = new Date();
      const yesterday = DateTime.now().minus({ days: 1 }).toJSDate();
      const thirtyFiveDaysAgo = DateTime.now().minus({ days: 35 }).toJSDate();
      const fiftyDaysAgo = DateTime.now().minus({ days: 50 }).toJSDate();
      DAYS = [thirtyFiveDaysAgo, today, fiftyDaysAgo, yesterday];
      DAYS_NOTIFICATIONS_KEPT = [today, yesterday];

      for (const day of DAYS) {
        await notificationsService.create(notificationFactory.build({
          userId: activeUser.id,
          senderId: user1.id,
          allUsers: [user1._id as any], // senderId must be in allUsers for old API compatibility
          createdAt: day,
        }));
      }
    });

    it('keep notifications for last 30 days only', async () => {
      const beforeNotificationsCount = await notificationModel.count();
      expect(beforeNotificationsCount).toBe(DAYS.length);

      const THIRTY_DAYS_AGO = DateTime.now().minus({ days: 30 }).toJSDate();

      // Provide a date argument to specify the last date before which all the notifications would be deleted
      await notificationsService.cleanupNotifications(THIRTY_DAYS_AGO);

      const staleNotificationCount = await notificationModel.count({ createdAt: { $lt: THIRTY_DAYS_AGO } });
      expect(staleNotificationCount).toBe(0);

      const notificationsCount = await notificationModel.count();
      expect(notificationsCount).toBe(DAYS_NOTIFICATIONS_KEPT.length);
    });
  });

  describe('#processNotification', () => {
    it('when is process false than expected notification response', async () => {
      const notification = await notificationsService.create(
        notificationFactory.build({
          userId: activeUser.id,
          is_deleted: NotificationDeletionStatus.NotDeleted,
          senderId: user1.id,
          allUsers: [user1._id as any], // senderId must be in allUsers for old API compatibility
        }),
      );
      await notificationsService.processNotification(notification.id);
      const notificationDetails = await notificationsService.findById(notification.id);
      expect(notificationDetails.isProcessed).toBe(true);
    });

    it('when is process true than expected notification response', async () => {
      const notification = await notificationsService.create(
        notificationFactory.build({
          userId: activeUser.id,
          is_deleted: NotificationDeletionStatus.NotDeleted,
          senderId: user1.id,
          allUsers: [user1._id as any], // senderId must be in allUsers for old API compatibility
          isProcessed: true,
        }),
      );
      await notificationsService.processNotification(notification.id);
      const notificationDetails = await notificationsService.findById(notification.id);
      expect(notificationDetails.isProcessed).toBe(true);
    });

    it('send push notification', async () => {
      jest.spyOn(pushNotificationsService, 'sendPushNotification').mockImplementation(() => Promise.resolve());
      const userDevices = [];
      const weekAgo = DateTime.now().minus({ days: 8 }).toISODate();
      userDevices.push(
        {
          ...deviceAndAppVersionPlaceholderSignInFields,
          login_date: weekAgo,
        },
      );
      const userData = userFactory.build({
        newNotificationCount: 1,
      });
      userData.userDevices = userDevices;
      user2 = await usersService.create(userData);
      await userSettingsService.create(userSettingFactory.build({
        userId: user2.id,
      }));
      const notificationObj = {
        userId: user2.id,
        feedPostId: feedPostData.id,
        senderId: user1.id,
        notifyType: NotificationType.UserMentionedYouInPost,
        notificationMsg: 'had mentioned you in a post',
      };
      const notificationData = await notificationsService.create(notificationObj);
      await notificationsService.processNotification(notificationData.id);
      expect(pushNotificationsService.sendPushNotification).toHaveBeenCalledWith(
        expect.objectContaining({ _id: notificationData._id.toString() }),
        [deviceAndAppVersionPlaceholderSignInFields.device_token],
        2,
      );
    });
  });
});
