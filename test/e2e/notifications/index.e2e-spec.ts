import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { NotificationsService } from '../../../src/notifications/providers/notifications.service';
import { NotificationDocument } from '../../../src/schemas/notification.schema';
import { UsersService } from '../../../src/users/providers/users.service';
import { User } from '../../../src/schemas/user.schema';
import { userFactory } from '../../factories/user.factory';
import { notificationFactory } from '../../factories/notification.factory';

describe('Notifications index (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let notificationsService: NotificationsService;
  let usersService: UsersService;
  let configService: ConfigService;
  let activeUser: User;
  let activeUserAuthToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

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
    await connection.dropDatabase();

    activeUser = await usersService.create(
      userFactory.build(),
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
