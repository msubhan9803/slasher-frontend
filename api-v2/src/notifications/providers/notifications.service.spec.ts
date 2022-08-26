import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import {
  NotificationDocument,
  Notification,
} from '../../schemas/notification.schema';
import { NotificationsService } from './notifications.service';
import { Model } from 'mongoose';
import { truncateAllCollections } from '../../../test/test-helpers';
import { UsersService } from '../../users/providers/users.service';
import { userFactory } from '../../../test/factories/user.factory';
import { notificationFactory } from '../../../test/factories/notification.factory';
import { UserDocument } from '../../schemas/user.schema';

describe('NotificationsService', () => {
  let app: INestApplication;
  let notificationsService: NotificationsService;
  let usersService: UsersService;
  let notificationModel: Model<NotificationDocument>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    notificationsService =
      moduleRef.get<NotificationsService>(NotificationsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    notificationModel = moduleRef.get<Model<NotificationDocument>>(
      getModelToken(Notification.name),
    );

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Truncate all db collections so we start fresh before each test
    await truncateAllCollections(notificationModel);
  });

  it('should be defined', () => {
    expect(notificationsService).toBeDefined();
  });

  describe('#findAllByUserId', () => {
    let user1: UserDocument;
    let user2: UserDocument;
    beforeEach(async () => {
      user1 = await usersService.create(
        userFactory.build({}, { transient: { unhashedPassword: 'password' } }),
      );
      user2 = await usersService.create(
        userFactory.build({}, { transient: { unhashedPassword: 'password' } }),
      );
      // Create some sample notifications
      for (let i = 0; i < 10; i++) {
        await notificationsService.create(
          notificationFactory.build({
            userId: i % 3 == 0 ? user1._id : user2._id,
          }),
        );
      }
    });

    it('returns the expected number of documents', async () => {
      expect(
        await notificationsService.findAllByUserId(user1._id),
      ).toHaveLength(4);
      expect(
        await notificationsService.findAllByUserId(user2._id),
      ).toHaveLength(6);
    });
  });
});
