import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { NotificationsService } from './notifications.service';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { UsersService } from '../../users/providers/users.service';
import { FeedPostsService } from '../../feed-posts/providers/feed-posts.service';
import { UserDocument } from '../../schemas/user/user.schema';
import { userFactory } from '../../../test/factories/user.factory';
import { NotificationType } from '../../schemas/notification/notification.enums';
import { feedPostFactory } from '../../../test/factories/feed-post.factory';
import { FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';

describe('NotificationsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let notificationsService: NotificationsService;
  let feedPostsService: FeedPostsService;
  let usersService: UsersService;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let feedPostData: FeedPostDocument;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);

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
    user1 = await usersService.create(userFactory.build());
    feedPostData = await feedPostsService.create(feedPostFactory.build({
      userId: activeUser.id,
    }));
  });

  it('should be defined', () => {
    expect(notificationsService).toBeDefined();
    expect(feedPostsService).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('#create', () => {
    it('creates the expected notification record', async () => {
      const notificationObj: any = {
        userId: activeUser.id,
        feedPostId: feedPostData.id,
        senderId: user1.id,
        notifyType: NotificationType.PostMention,
        notificationMsg: 'had mentioned you in a post',
      };
      const notificationData = await notificationsService.create(notificationObj);
      expect(notificationData.userId.toString()).toBe(activeUser.id);
    });
  });
});
