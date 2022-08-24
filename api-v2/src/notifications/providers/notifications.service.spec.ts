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

describe('NotificationsService', () => {
  let app: INestApplication;
  let notificationsService: NotificationsService;
  let notificationModel: Model<NotificationDocument>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    notificationsService =
      moduleRef.get<NotificationsService>(NotificationsService);
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
});
