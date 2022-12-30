import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../../app.module';
import { NotificationsService } from '../../../notifications/providers/notifications.service';
import { clearDatabase } from '../../../../test/helpers/mongo-helpers';
import { UsersService } from '../../../users/providers/users.service';
import { userFactory } from '../../../../test/factories/user.factory';
import { NotificationType } from '../../../schemas/notification/notification.enums';
import { FeedPostDocument } from '../../../schemas/feedPost/feedPost.schema';
import { feedPostFactory } from '../../../../test/factories/feed-post.factory';
import { FeedPostsService } from '../../../feed-posts/providers/feed-posts.service';
import { UserDocument } from '../../../schemas/user/user.schema';
import cleanupNotifications from './cleanupNotifications';

// Run this file by running below command:
// npm run test -- --watch src/app/providers/cleanup-notifications/cleanupNotifications.spec.ts

describe('Notifications Cleanup', () => {
  let app: INestApplication;
  let connection: Connection;
  let notificationsService: NotificationsService;
  let usersService: UsersService;
  let feedPostData: FeedPostDocument;
  let activeUser: UserDocument;
  let feedPostsService: FeedPostsService;

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
    feedPostData = await feedPostsService.create(
      feedPostFactory.build({
        userId: activeUser.id,
      }),
    );
  });

  describe('Keep only last 80 notificaitons of users', () => {
    // const TEST_TIMEOUT = 10_000;
    const TEST_TIMEOUT = 10 * 60_000;
    it(
      'simple-test-1',
      async () => {
        function addDays(date, days) {
          const result = new Date(date);
          result.setDate(result.getDate() + days);
          return result;
        }

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

        const today = new Date();
        const yesterday = addDays(today, -1);
        const yesterday2 = addDays(today, -2);
        const yesterday3 = addDays(today, -3);

        // SPECS: 46k Users, 13.2M Notifications, 330 notifications each
        const AMOUNT = 80;
        const USERS = 3; // NEEDS to be 46K to mimic real data
        const DAYS = [yesterday3, today, yesterday2, yesterday];

        const sender = await usersService.create(userFactory.build());

        for (let i = 0; i < USERS; i += 1) {
          const user = await usersService.create(userFactory.build());
          // Number of notification created for a user for 4 days (80*4days = 320 notifications)
          const bulkNotifications = DAYS.map((day) => getManyNotifications(user, sender, AMOUNT, day)).flatMap(
            (a) => a,
          );
          await notificationsService.insertMany(bulkNotifications);
        }

        await cleanupNotifications(notificationsService, 80); // 80 = amount of latest notifications we keep for a user

        const expectedCount = USERS * AMOUNT;
        expect(await notificationsService.estimatedDocumentCount()).toBe(expectedCount);
        expect(await notificationsService._find({ createdAt: today })).toHaveLength(expectedCount);
        expect(1).toBe(1);
      },
      TEST_TIMEOUT,
    );
  });
});
