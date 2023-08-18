import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { NotificationsService } from '../../../../../src/notifications/providers/notifications.service';
import { notificationFactory } from '../../../../factories/notification.factory';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import {
  NotificationDeletionStatus,
  NotificationReadStatus,
} from '../../../../../src/schemas/notification/notification.enums';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { UserSettingsService } from '../../../../../src/settings/providers/user-settings.service';
import { userSettingFactory } from '../../../../factories/user-setting.factory';

describe('Patch Notifications Mark As Read(e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let notificationsService: NotificationsService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let configService: ConfigService;
  let activeUser;
  let user0;
  let notification;
  let notification1;
  let userSettingsService: UserSettingsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    userSettingsService = moduleRef.get<UserSettingsService>(UserSettingsService);
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
    user0 = await usersService.create(userFactory.build());
    await userSettingsService.create(
      userSettingFactory.build(
        {
          userId: user0._id,
        },
      ),
    );
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    notification = await notificationsService.create(
      notificationFactory.build({
        is_deleted: NotificationDeletionStatus.NotDeleted,
        userId: activeUser.id,
      }),
    );

    notification1 = await notificationsService.create(
      notificationFactory.build({
        is_deleted: NotificationDeletionStatus.NotDeleted,
        userId: user0._id.toString(),
      }),
    );
  });

  describe('PATCH /api/v1/notifications/:id/mark-as-read', () => {
    it('requires authentication', async () => {
      const notificationId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).patch(`/api/v1/notifications/${notificationId}/mark-as-read`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('mark as read notification', () => {
      it('successfully marks the notification as read and returns the expected response.', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/notifications/${notification._id}/mark-as-read`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        const notificationsDetails = await notificationsService.findById(notification._id);
        expect(notificationsDetails.isRead).toEqual(NotificationReadStatus.Read);
        expect(response.body).toEqual({ success: true });
      });

      it('returns the expected response when the notification id does not exist.', async () => {
        const notificationId = '5c9c60ca59bf9617c18f6cec';
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/notifications/${notificationId}/mark-as-read`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({ message: 'Notification not found', statusCode: 404 });
      });

      it('returns the expected response when the notification is owned by a different user.', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/notifications/${notification1._id}/mark-as-read`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({ message: 'Permission denied.', statusCode: 401 });
      });
    });

    describe('Validation', () => {
      it('id must be a mongodb id', async () => {
        const notificationId = 'not-a-mongo-id';
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/notifications/${notificationId}/mark-as-read`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'id must be a mongodb id',
        );
      });
    });
  });
});
