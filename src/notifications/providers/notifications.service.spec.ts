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
 NotificationType, NotificationDeletionStatus, NotificationReadStatus, NotificationStatus,
} from '../../schemas/notification/notification.enums';
import { feedPostFactory } from '../../../test/factories/feed-post.factory';
import { FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';

import { notificationFactory } from '../../../test/factories/notification.factory';

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
        notifyType: NotificationType.PostMention,
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
            status: NotificationStatus.Active,
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
            status: NotificationStatus.Active,
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
});
