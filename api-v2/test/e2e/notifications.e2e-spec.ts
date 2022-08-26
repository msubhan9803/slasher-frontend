import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { NotificationsService } from '../../src/notifications/providers/notifications.service';
import {
  Notification,
  NotificationDocument,
} from '../../src/schemas/notification.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { truncateAllCollections } from '../test-helpers';
import { UsersService } from '../../src/users/providers/users.service';
import { User, ActiveStatus } from '../../src/schemas/user.schema';
import { userFactory } from '../factories/user.factory';
import { notificationFactory } from '../factories/notification.factory';
import { ConfigService } from '@nestjs/config';

describe('Notifications (e2e)', () => {
  let app: INestApplication;
  let notificationsService: NotificationsService;
  let notificationModel: Model<NotificationDocument>;
  let usersService: UsersService;
  let configService: ConfigService;
  let activeUser: User;
  let activeUserUnhashedPassword: string;
  let activeUserAuthToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    notificationsService =
      moduleRef.get<NotificationsService>(NotificationsService);
    notificationModel = moduleRef.get<Model<NotificationDocument>>(
      getModelToken(Notification.name),
    );
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Truncate all db collections so we start fresh before each test
    await truncateAllCollections(notificationModel);

    activeUserUnhashedPassword = 'TestPassword';
    activeUser = await usersService.create(
      userFactory.build(
        { status: ActiveStatus.Active },
        { transient: { unhashedPassword: activeUserUnhashedPassword } },
      ),
    );
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('GET /notifications', () => {
    let notifications: NotificationDocument[];
    beforeEach(async () => {
      notifications = [
        await notificationsService.create(
          notificationFactory.build({
            userId: activeUser._id,
          }),
        ),
        await notificationsService.create(
          notificationFactory.build({
            userId: activeUser._id,
          }),
        ),
      ];
    });

    it('returns the expected response', () => {
      const expectedResponse = notifications
        .map((notification) => ({
          notificationMsg: notification.notificationMsg,
          createdAt: notification.createdAt.toISOString(),
        }))
        // reverse because we expect notifications to be returned with most recently created first
        .reverse();
      return request(app.getHttpServer())
        .get('/notifications')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .expect(expectedResponse);
    });
  });
});
