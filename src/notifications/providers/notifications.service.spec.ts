import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
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
import { addDays } from '../../utils/date-utils';

describe('NotificationsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let notificationsService: NotificationsService;
  let feedPostsService: FeedPostsService;
  let usersService: UsersService;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let feedPostData: FeedPostDocument;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    activeUser = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
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
        notifyType: NotificationType.UserMentionedYouInPost,
        notificationMsg: 'had mentioned you in a post',
      };
      const notificationData = await notificationsService.create(notificationObj);
      expect(notificationData.userId.toString()).toBe(activeUser.id);
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
            userId: activeUser._id,
          },
        ),
      );
    });
    it('finds the expected notification details', async () => {
      const notificationDetails = await notificationsService.findById(notification._id);
      expect(notificationDetails.notificationMsg).toEqual(notification.notificationMsg);
    });
  });

  describe('#update', () => {
    let notification;
    beforeEach(async () => {
      notification = await notificationsService.create(
        notificationFactory.build(
          {
            userId: activeUser._id,
          },
        ),
      );
    });
    it('finds the expected notification and update the details', async () => {
      const notificationData = {
        notificationMsg: 'notification test message',
      };
      const updatedNotification = await notificationsService.update(notification._id, notificationData);
      const reloadedNotification = await notificationsService.findById(updatedNotification._id);
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
    it('keep notifications for last 30 days only', async () => {
      const USERS = 10;
      const AMOUNT = 1;

      const today = new Date();
      const yesterday = addDays(today, -1);
      const monthAgo1 = addDays(today, -35);
      const monthAgo2 = addDays(today, -50);
      const DAYS = [monthAgo1, today, monthAgo2, yesterday];
      const DAYS_NOTIFICATIONS_KEPT = [today, yesterday];

      async function createNotifications() {
        function getManyNotifications(user, sender, number, inputDate: Date) {
          const n = [];
          for (let i = 0; i < number; i += 1) {
            n.push({
              userId: user.id,
              feedPostId: feedPostData.id,
              senderId: sender.id,
              notifyType: NotificationType.UserMentionedYouInPost,
              notificationMsg: 'had mentioned you in a post',
              createdAt: inputDate,
            });
          }
          return n;
        }

        const sender = await usersService.create(userFactory.build());

        const bulkUsers = [];
        for (let j = 0; j < USERS; j += 1) {
          const user = await usersService.create(userFactory.build());
          const bulkNotifications = DAYS.map((day) => getManyNotifications(user, sender, AMOUNT, day)).flatMap(
            (a) => a,
          );
          bulkUsers.push(...bulkNotifications);
        }
        await notificationsService.insertMany(bulkUsers);
      }

      await createNotifications();

      const MONTH_AGO = addDays(new Date(), -30);

      // Provide a date argument to specify the last date before which all the notifications would be deleted
      await notificationsService.cleanupNotifications(MONTH_AGO);

      const notificationStale = await notificationsService._find({ createdAt: { $lt: MONTH_AGO } });
      expect(notificationStale).toHaveLength(0);

      const notificationsCount = await notificationsService.count();
      expect(notificationsCount).toBe(USERS * AMOUNT * DAYS_NOTIFICATIONS_KEPT.length);
    });
  });
});
