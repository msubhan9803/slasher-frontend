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
import { NotificationDeletionStatus } from '../../../../../src/schemas/notification/notification.enums';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { UserSettingsService } from '../../../../../src/settings/providers/user-settings.service';
import { userSettingFactory } from '../../../../factories/user-setting.factory';

describe('Delete Notifications (e2e)', () => {
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

  describe('DELETE /api/v1/notifications/:id', () => {
    it('requires authentication', async () => {
      const notificationId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).delete(`/api/v1/notifications/${notificationId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('delete notifications', () => {
      it('successfully deletes the notification and returns the expected response.', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/notifications/${notification._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        const notificationsDetails = await notificationsService.findById(notification._id);
        expect(notificationsDetails.is_deleted).toBe(NotificationDeletionStatus.Deleted);
        expect(response.body).toEqual({ success: true });
      });

      it('returns the expected response when the notification id does not exist.', async () => {
        const notificationId = '5c9c60ca59bf9617c18f6cec';
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/notifications/${notificationId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({ message: 'Notification not found', statusCode: 404 });
      });

      it('returns the expected response when the notification is owned by a different user', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/notifications/${notification1._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({ message: 'Permission denied.', statusCode: 401 });
      });
    });
  });
});
