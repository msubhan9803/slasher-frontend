import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { NotificationsService } from '../../../src/notifications/providers/notifications.service';
import { notificationFactory } from '../../factories/notification.factory';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { NotificationDeletionStatus } from '../../../src/schemas/notification/notification.enums';

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
    user0 = await usersService.create(userFactory.build());
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

  describe('Delete /notifications/:id', () => {
    describe('delete notifications', () => {
      it('successfully deletes the notification and returns the expected response.', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/notifications/${notification._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        const notificationsDetails = await notificationsService.findById(notification._id);
        expect(notificationsDetails.is_deleted).toBe(NotificationDeletionStatus.Deleted);
        expect(response.body).toEqual({ success: true });
      });

      it('returns the expected response when the notification id does not exist.', async () => {
        const notificationId = '5c9c60ca59bf9617c18f6cec';
        const response = await request(app.getHttpServer())
          .delete(`/notifications/${notificationId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({ message: 'Notification not found', statusCode: 404 });
      });

      it('returns the expected response when the notification is owned by a different user', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/notifications/${notification1._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({ message: 'Permission denied.', statusCode: 401 });
      });
    });
  });
});
