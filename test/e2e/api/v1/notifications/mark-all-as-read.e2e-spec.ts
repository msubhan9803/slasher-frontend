import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
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

describe('All Mark As Read Notifications (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let notificationsService: NotificationsService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser;
  let configService: ConfigService;
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
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    for (let index = 0; index < 5; index += 1) {
      await notificationsService.create(
        notificationFactory.build({
          is_deleted: NotificationDeletionStatus.NotDeleted,
          userId: activeUser._id,
        }),
      );
    }
  });

  describe('PATCH /api/v1/notifications/mark-all-as-read', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).patch('/api/v1/notifications/mark-all-as-read').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('All Mark As Read Notifications', () => {
      it('finds all the expected isRead mark as read notifications details', async () => {
        const response = await request(app.getHttpServer())
          .patch('/api/v1/notifications/mark-all-as-read')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        const getAllReadNotifications = await notificationsService.findAllByUser(activeUser._id.toString(), 15);
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
