import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { NotificationsService } from './notifications.service';
import { UsersService } from '../../users/providers/users.service';
import { userFactory } from '../../../test/factories/user.factory';
import { notificationFactory } from '../../../test/factories/notification.factory';
import { UserDocument } from '../../schemas/user/user.schema';
import { dropCollections } from '../../../test/helpers/mongo-helpers';

describe('NotificationsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let notificationsService: NotificationsService;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    usersService = moduleRef.get<UsersService>(UsersService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await dropCollections(connection);
  });

  it('should be defined', () => {
    expect(notificationsService).toBeDefined();
  });

  describe('#findAllByUserId', () => {
    let user1: UserDocument;
    let user2: UserDocument;
    beforeEach(async () => {
      user1 = await usersService.create(
        userFactory.build(),
      );
      user2 = await usersService.create(
        userFactory.build(),
      );
      // Create some sample notifications
      for (let i = 0; i < 10; i += 1) {
        await notificationsService.create(
          notificationFactory.build({
            userId: i % 3 === 0 ? user1._id : user2._id,
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
