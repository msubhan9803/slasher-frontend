/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { NotificationsService } from '../../../../../src/notifications/providers/notifications.service';
import { notificationFactory } from '../../../../factories/notification.factory';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { NotificationDeletionStatus } from '../../../../../src/schemas/notification/notification.enums';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import type { NotificationDocument } from '../../../../../src/schemas/notification/notification.schema';
import { FeedPost, FeedPostDocument } from '../../../../../src/schemas/feedPost/feedPost.schema';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { RssFeedProvider, RssFeedProviderDocument } from '../../../../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { rssFeedProviderFactory } from '../../../../factories/rss-feed-providers.factory';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { UserSettingsService } from '../../../../../src/settings/providers/user-settings.service';
import { userSettingFactory } from '../../../../factories/user-setting.factory';

describe('All Notifications (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let notificationsService: NotificationsService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser;
  let configService: ConfigService;
  let notificationDates: Array<{ createdAt: Date, lastUpdateAt: Date }>;
  let allNotifications: NotificationDocument[];
  let feedPostModel: Model<FeedPostDocument>;
  let feedPostData: FeedPostDocument;
  let rssFeedProviderData: RssFeedProviderDocument;
  let rssFeedProviderModel: Model<RssFeedProviderDocument>;
  let userSettingsService: UserSettingsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostModel = moduleRef.get<Model<FeedPostDocument>>(getModelToken(FeedPost.name));
    userSettingsService = moduleRef.get<UserSettingsService>(UserSettingsService);
    rssFeedProviderModel = moduleRef.get<Model<RssFeedProviderDocument>>(getModelToken(RssFeedProvider.name));
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

    notificationDates = [
      {
        createdAt: DateTime.fromISO('2022-01-10T00:00:00Z').toJSDate(),
        lastUpdateAt: DateTime.fromISO('2022-01-11T00:00:00Z').toJSDate(),
      },
      {
        createdAt: DateTime.fromISO('2022-01-08T00:00:00Z').toJSDate(),
        lastUpdateAt: DateTime.fromISO('2022-01-09T00:00:00Z').toJSDate(),
      },
      {
        createdAt: DateTime.fromISO('2022-01-06T00:00:00Z').toJSDate(),
        lastUpdateAt: DateTime.fromISO('2022-01-07T00:00:00Z').toJSDate(),
      },
      {
        createdAt: DateTime.fromISO('2022-01-04T00:00:00Z').toJSDate(),
        lastUpdateAt: DateTime.fromISO('2022-01-05T00:00:00Z').toJSDate(),
      },
      {
        createdAt: DateTime.fromISO('2022-01-02T00:00:00Z').toJSDate(),
        lastUpdateAt: DateTime.fromISO('2022-01-03T00:00:00Z').toJSDate(),
      },
    ];

    activeUser = await usersService.create(userFactory.build());
    await userSettingsService.create(
      userSettingFactory.build(
        {
          userId: activeUser._id,
        },
      ),
    );
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    feedPostData = await feedPostModel.create(feedPostFactory.build({
      userId: activeUser.id,
    }));
    rssFeedProviderData = await rssFeedProviderModel.create(rssFeedProviderFactory.build());

    allNotifications = [];
    for (let index = 0; index < 5; index += 1) {
      const notification = await notificationsService.create(
        notificationFactory.build({
          feedCommentId: new mongoose.Types.ObjectId() as any,
          feedReplyId: new mongoose.Types.ObjectId() as any,
          feedPostId: feedPostData.id,
          rssFeedProviderId: rssFeedProviderData._id,
          senderId: activeUser.id,
          allUsers: [activeUser._id as any], // senderId must be in allUsers for old API compatibility
          is_deleted: NotificationDeletionStatus.NotDeleted,
          userId: activeUser.id,
          ...notificationDates[index],
        }),
      );
      allNotifications.push(notification);
    }
  });

  describe('GET /api/v1/notifications', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/notifications').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Get All Notifications', () => {
      it('finds all the expected notifications details', async () => {
        const limit = 5;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/notifications?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        for (let index = 1; index < response.body.length; index += 1) {
          expect(response.body[index - 1].createdAt > response.body[index].createdAt).toBe(true);
        }
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toHaveLength(5);

        expect(response.body).toEqual([
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            createdAt: notificationDates[0].createdAt.toISOString(),
            feedCommentId: allNotifications[0].feedCommentId.toString(),
            feedPostId: {
              _id: feedPostData.id.toString(),
              userId: feedPostData.userId.toString(),
              movieId: null,
              bookId: null,
              postType: 1,
            },
            feedReplyId: allNotifications[0].feedReplyId.toString(),
            isRead: 0,
            notificationMsg: 'Message 1',
            notifyType: 1,
            rssFeedProviderId: {
              _id: rssFeedProviderData._id.toString(),
              logo: rssFeedProviderData.logo,
              title: rssFeedProviderData.title,
            },
            senderId: {
              _id: activeUser.id,
              profilePic: expect.any(String),
              userName: activeUser.userName,
            },
            userId: activeUser.id,
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            createdAt: notificationDates[1].createdAt.toISOString(),
            feedCommentId: allNotifications[1].feedCommentId.toString(),
            feedPostId: {
              _id: feedPostData.id.toString(),
              userId: feedPostData.userId.toString(),
              movieId: null,
              bookId: null,
              postType: 1,
            },
            feedReplyId: allNotifications[1].feedReplyId.toString(),
            isRead: 0,
            notificationMsg: 'Message 2',
            notifyType: 1,
            rssFeedProviderId: {
              _id: rssFeedProviderData._id.toString(),
              logo: rssFeedProviderData.logo,
              title: rssFeedProviderData.title,
            },
            senderId: {
              _id: activeUser.id,
              profilePic: expect.any(String),
              userName: activeUser.userName,
            },
            userId: activeUser.id,
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            createdAt: notificationDates[2].createdAt.toISOString(),
            feedCommentId: allNotifications[2].feedCommentId.toString(),
            feedPostId: {
              _id: feedPostData.id.toString(),
              userId: feedPostData.userId.toString(),
              movieId: null,
              bookId: null,
              postType: 1,
            },
            feedReplyId: allNotifications[2].feedReplyId.toString(),
            isRead: 0,
            notificationMsg: 'Message 3',
            notifyType: 1,
            rssFeedProviderId: {
              _id: rssFeedProviderData._id.toString(),
              logo: rssFeedProviderData.logo,
              title: rssFeedProviderData.title,
            },
            senderId: {
              _id: activeUser.id,
              profilePic: expect.any(String),
              userName: activeUser.userName,
            },
            userId: activeUser.id,
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            createdAt: notificationDates[3].createdAt.toISOString(),
            feedCommentId: allNotifications[3].feedCommentId.toString(),
            feedPostId: {
              _id: feedPostData.id.toString(),
              userId: feedPostData.userId.toString(),
              movieId: null,
              bookId: null,
              postType: 1,
            },
            feedReplyId: allNotifications[3].feedReplyId.toString(),
            isRead: 0,
            notificationMsg: 'Message 4',
            notifyType: 1,
            rssFeedProviderId: {
              _id: rssFeedProviderData._id.toString(),
              logo: rssFeedProviderData.logo,
              title: rssFeedProviderData.title,
            },
            senderId: {
              _id: activeUser.id,
              profilePic: expect.any(String),
              userName: activeUser.userName,
            },
            userId: activeUser.id,
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            createdAt: notificationDates[4].createdAt.toISOString(),
            feedCommentId: allNotifications[4].feedCommentId.toString(),
            feedPostId: {
              _id: feedPostData.id.toString(),
              userId: feedPostData.userId.toString(),
              movieId: null,
              bookId: null,
              postType: 1,
            },
            feedReplyId: allNotifications[4].feedReplyId.toString(),
            isRead: 0,
            notificationMsg: 'Message 5',
            notifyType: 1,
            rssFeedProviderId: {
              _id: rssFeedProviderData._id.toString(),
              logo: rssFeedProviderData.logo,
              title: rssFeedProviderData.title,
            },
            senderId: {
              _id: activeUser.id,
              profilePic: expect.any(String),
              userName: activeUser.userName,
            },
            userId: activeUser.id,
          },
        ]);
      });

      describe('when `before` argument is supplied', () => {
        it('get expected first and second sets of paginated results', async () => {
          const limit = 3;
          const firstResponse = await request(app.getHttpServer())
            .get(`/api/v1/notifications?limit=${limit}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();

          for (let index = 1; index < firstResponse.body.length; index += 1) {
            expect(firstResponse.body[index - 1].createdAt > firstResponse.body[index].createdAt).toBe(true);
          }
          expect(firstResponse.status).toEqual(HttpStatus.OK);
          expect(firstResponse.body).toHaveLength(3);

          const secondResponse = await request(app.getHttpServer())
            .get(`/api/v1/notifications?limit=${limit}&before=${firstResponse.body[limit - 1]._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();

          for (let index = 1; index < secondResponse.body.length; index += 1) {
            expect(secondResponse.body[index - 1].createdAt > secondResponse.body[index].createdAt).toBe(true);
          }
          expect(secondResponse.status).toEqual(HttpStatus.OK);
          expect(secondResponse.body).toHaveLength(2);
        });
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/notifications')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'limit must not be greater than 20',
            'limit must be a number conforming to the specified constraints',
            'limit should not be empty',
          ],
          statusCode: 400,
        });
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/notifications?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'limit must not be greater than 20',
            'limit must be a number conforming to the specified constraints',
          ],
          statusCode: 400,
        });
      });

      it('limit should not be grater than 20', async () => {
        const limit = 21;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/notifications?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'limit must not be greater than 20',
          ],
          statusCode: 400,
        });
      });

      it('`before` must be a mongodb id', async () => {
        const limit = 3;
        const before = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/notifications?limit=${limit}&before=${before}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'before must be a mongodb id',
          ],
          statusCode: 400,
        });
      });
    });
  });
});
