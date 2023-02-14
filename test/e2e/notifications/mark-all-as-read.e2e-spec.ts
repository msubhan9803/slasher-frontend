import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { NotificationsService } from '../../../src/notifications/providers/notifications.service';
import { notificationFactory } from '../../factories/notification.factory';
import { clearDatabase } from '../../helpers/mongo-helpers';
import {
  NotificationDeletionStatus,
  NotificationReadStatus,
} from '../../../src/schemas/notification/notification.enums';

describe('All Mark As Read Notifications (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let notificationsService: NotificationsService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser;
  let configService: ConfigService;

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

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    for (let index = 0; index < 5; index += 1) {
      await notificationsService.create(
        notificationFactory.build({
          is_deleted: NotificationDeletionStatus.NotDeleted,
          userId: activeUser.id,
        }),
      );
    }
  });

  describe('Patch /notifications/mark-all-as-read', () => {
    describe('All Mark As Read Notifications', () => {
      it('finds all the expected isRead mark as read notifications details', async () => {
        const response = await request(app.getHttpServer())
          .patch('/notifications/mark-all-as-read')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        const getAllReadNotifications = await notificationsService.findAllByUser(activeUser.id, 15);
        for (const read of getAllReadNotifications) {
          expect(read.isRead).toEqual(NotificationReadStatus.Read);
        }
        expect(response.status).toEqual(HttpStatus.OK);
        expect(getAllReadNotifications).toHaveLength(5);
        expect(response.body).toEqual({ success: true });
      });
    });
  });
});
