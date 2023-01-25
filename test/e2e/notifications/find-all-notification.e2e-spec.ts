import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { NotificationsService } from '../../../src/notifications/providers/notifications.service';
import { notificationFactory } from '../../factories/notification.factory';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { NotificationDeletionStatus } from '../../../src/schemas/notification/notification.enums';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';

describe('All Notifications (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let notificationsService: NotificationsService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser;
  let configService: ConfigService;
  let notificationDates: Array<{ createdAt: Date, lastUpdateAt: Date }>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

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
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    for (let index = 0; index < 5; index += 1) {
      await notificationsService.create(
        notificationFactory.build({
          is_deleted: NotificationDeletionStatus.NotDeleted,
          userId: activeUser._id.toString(),
          ...notificationDates[index],
        }),
      );
    }
  });

  describe('GET /notifications', () => {
    describe('Get All Notifications', () => {
      it('finds all the expected notifications details', async () => {
        const limit = 5;
        const response = await request(app.getHttpServer())
          .get(`/notifications?limit=${limit}`)
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
            feedCommentId: null,
            feedPostId: null,
            feedReplyId: null,
            isRead: 0,
            notificationMsg: 'Message 1',
            notifyType: 1,
            rssFeedProviderId: null,
            senderId: null,
            userId: activeUser._id.toString(),
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            createdAt: notificationDates[1].createdAt.toISOString(),
            feedCommentId: null,
            feedPostId: null,
            feedReplyId: null,
            isRead: 0,
            notificationMsg: 'Message 2',
            notifyType: 1,
            rssFeedProviderId: null,
            senderId: null,
            userId: activeUser._id.toString(),
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            createdAt: notificationDates[2].createdAt.toISOString(),
            feedCommentId: null,
            feedPostId: null,
            feedReplyId: null,
            isRead: 0,
            notificationMsg: 'Message 3',
            notifyType: 1,
            rssFeedProviderId: null,
            senderId: null,
            userId: activeUser._id.toString(),
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            createdAt: notificationDates[3].createdAt.toISOString(),
            feedCommentId: null,
            feedPostId: null,
            feedReplyId: null,
            isRead: 0,
            notificationMsg: 'Message 4',
            notifyType: 1,
            rssFeedProviderId: null,
            senderId: null,
            userId: activeUser._id.toString(),
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            createdAt: notificationDates[4].createdAt.toISOString(),
            feedCommentId: null,
            feedPostId: null,
            feedReplyId: null,
            isRead: 0,
            notificationMsg: 'Message 5',
            notifyType: 1,
            rssFeedProviderId: null,
            senderId: null,
            userId: activeUser._id.toString(),
          },
        ]);
      });

      describe('when `before` argument is supplied', () => {
        it('get expected first and second sets of paginated results', async () => {
          const limit = 3;
          const firstResponse = await request(app.getHttpServer())
            .get(`/notifications?limit=${limit}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();

          for (let index = 1; index < firstResponse.body.length; index += 1) {
            expect(firstResponse.body[index - 1].createdAt > firstResponse.body[index].createdAt).toBe(true);
          }
          expect(firstResponse.status).toEqual(HttpStatus.OK);
          expect(firstResponse.body).toHaveLength(3);

          const secondResponse = await request(app.getHttpServer())
            .get(`/notifications?limit=${limit}&before=${firstResponse.body[limit - 1]._id}`)
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
          .get('/notifications')
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
          .get(`/notifications?limit=${limit}`)
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
          .get(`/notifications?limit=${limit}`)
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
          .get(`/notifications?limit=${limit}&before=${before}`)
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
