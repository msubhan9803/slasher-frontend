import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io } from 'socket.io-client';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../src/app.module';
import { UserDocument } from '../../src/schemas/user/user.schema';
import { UsersService } from '../../src/users/providers/users.service';
import { userFactory } from '../factories/user.factory';
import { clearDatabase } from '../helpers/mongo-helpers';
import { RedisIoAdapter } from '../../src/adapters/redis-io.adapter';
import { waitForAuthSuccessMessage, waitForSocketUserCleanup } from '../helpers/gateway-test-helpers';
import { feedPostFactory } from '../factories/feed-post.factory';
import { FeedPostsService } from '../../src/feed-posts/providers/feed-posts.service';
import { NotificationType } from '../../src/schemas/notification/notification.enums';
import { NotificationsService } from '../../src/notifications/providers/notifications.service';
import { FeedPostDocument } from '../../src/schemas/feedPost/feedPost.schema';
import { rewindAllFactories } from '../helpers/factory-helpers.ts';
import { RssFeedProvidersService } from '../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { RssFeedProvider } from '../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { RssFeedProviderActiveStatus } from '../../src/schemas/rssFeedProvider/rssFeedProvider.enums';
import { rssFeedProviderFactory } from '../factories/rss-feed-providers.factory';
import { PostType } from '../../src/schemas/feedPost/feedPost.enums';

describe('Notifications Gateway (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let configService: ConfigService;
  let baseAddress: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let activeUserAuthToken: string;
  let feedPostsService: FeedPostsService;
  let notificationsService: NotificationsService;
  let feedPostData: FeedPostDocument;
  let rssFeedProvidersService: RssFeedProvidersService;
  let rssFeedProviderData: RssFeedProvider;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);

    app = moduleRef.createNestApplication();

    // Set up redis adapter
    const redisIoAdapter = new RedisIoAdapter(app, configService);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);

    // For socket tests, we use app.listen() instead of app.init()
    await app.listen(configService.get<number>('PORT'));
    baseAddress = `http://localhost:${configService.get<number>('PORT')}`;
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
    user1 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    feedPostData = await feedPostsService.create(feedPostFactory.build({
      userId: activeUser.id,
    }));
    rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build({
      status: RssFeedProviderActiveStatus.Active,
      logo: 'noUser.jpg',
    }));
  });

  it('NotificationsService#create calls emitMessageForNotification, which emits the expected socket message', async () => {
    const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
    await waitForAuthSuccessMessage(client);

    const notificationObj: any = {
      userId: activeUser.id,
      feedPostId: feedPostData.id,
      rssFeedProviderId: rssFeedProviderData._id.toString(),
      senderId: user1.id,
      allUsers: [user1._id as any], // senderId must be in allUsers for old API compatibility
      notifyType: NotificationType.UserMentionedYouInPost,
      notificationMsg: 'mentioned you in a post',
    };

    const notification = await notificationsService.create(notificationObj);

    let receivedPayload;
    const socketListenPromise = new Promise<void>((resolve) => {
      client.on('notificationReceived', (...args) => {
        // NOTE: Avoid calling expect() method inside of the on() method, or the test will hang
        // if expect() comparison fails.
        [receivedPayload] = args;
        resolve();
      });
    });

    // Await socket response to receive emitted event
    await socketListenPromise;

    expect(receivedPayload).toEqual({
      notification: {
        _id: notification._id.toString(),
        notifyType: 99,
        senderId: {
          _id: user1.id,
          userName: 'Username2',
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
        },
        feedPostId: {
          _id: feedPostData.id,
          userId: activeUser.id,
          movieId: null,
          postType: PostType.User,
        },
        feedCommentId: null,
        feedReplyId: null,
        rssFeedProviderId: {
          _id: rssFeedProviderData._id.toString(),
          logo: 'http://localhost:4444/placeholders/default_user_icon.png',
          title: 'RssFeedProvider 1',
        },
        userId: activeUser.id,
        notificationMsg: 'mentioned you in a post',
        isRead: 0,
        createdAt: expect.any(String),
      },
    });

    client.close();

    // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
    await waitForSocketUserCleanup(client, usersService);
  });

  describe('#clearNewNotificationCount', () => {
    it('when clean new notification count', async () => {
      const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
      await waitForAuthSuccessMessage(client);

      const response = await new Promise<any>((resolve) => {
        client.emit('clearNewNotificationCount', (data) => {
          resolve(data);
        });
      });
      client.close();
      expect(response).toEqual({ newNotificationCount: 0 });
      // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
      await waitForSocketUserCleanup(client, usersService);
    });
  });
});
