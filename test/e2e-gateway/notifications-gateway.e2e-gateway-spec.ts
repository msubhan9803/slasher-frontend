import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { io } from 'socket.io-client';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { UserDocument } from '../../src/schemas/user/user.schema';
import { UsersService } from '../../src/users/providers/users.service';
import { userFactory } from '../factories/user.factory';
import { clearDatabase } from '../helpers/mongo-helpers';
import { RedisIoAdapter } from '../../src/adapters/redis-io.adapter';
import { waitForAuthSuccessMessage, waitForSocketUserCleanup } from '../helpers/gateway-test-helpers';
import { NotificationsGateway } from '../../src/notifications/providers/notifications.gateway';
import { feedPostFactory } from '../factories/feed-post.factory';
import { FeedPostsService } from '../../src/feed-posts/providers/feed-posts.service';
import { NotificationType } from '../../src/schemas/notification/notification.enums';
import { NotificationsService } from '../../src/notifications/providers/notifications.service';
import { FeedPostDocument } from '../../src/schemas/feedPost/feedPost.schema';

describe('Notifications Gateway (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let configService: ConfigService;
  let baseAddress: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let activeUserAuthToken: string;
  let notificationsGateway: NotificationsGateway;
  let feedPostsService: FeedPostsService;
  let notificationsService: NotificationsService;
  let feedPostData: FeedPostDocument;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    notificationsGateway = moduleRef.get<NotificationsGateway>(NotificationsGateway);
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);

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

    activeUser = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    feedPostData = await feedPostsService.create(feedPostFactory.build({
      userId: activeUser.id,
    }));
  });

  it('should properly handle a getNotifications event', async () => {
    const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
    await waitForAuthSuccessMessage(client);

    const payload = { message: 'test' };
    await new Promise<void>((resolve) => {
      client.emit('getNotifications', payload, (data) => {
        expect(data).toBe(`getNotifications response.  received: ${payload.message}`);
        resolve();
      });
    });

    client.close();

    // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
    await waitForSocketUserCleanup(client, usersService);
  });

  it('a client should receive an event when a request is made to the /notifications/socket-test endpoint', async () => {
    const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
    await waitForAuthSuccessMessage(client);

    const socketListenPromise = new Promise<void>((resolve) => {
      client.once('hello', (...args) => {
        expect(args[0]).toBe('world');
        resolve();
      });
    });

    // Make request that will trigger emitted event
    await request(app.getHttpServer())
      .post('/notifications/socket-test')
      .auth(activeUserAuthToken, { type: 'bearer' })
      .expect(HttpStatus.CREATED)
      .expect('test');

    // Await socket response to receive emitted event
    await socketListenPromise;

    client.close();

    // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
    await waitForSocketUserCleanup(client, usersService);
  });

  it('a client should receive an event when a create post with active user id', async () => {
    const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
    await waitForAuthSuccessMessage(client);

    const notificationObj: any = {
      userId: activeUser.id,
      feedPostId: feedPostData.id,
      senderId: user1.id,
      notifyType: NotificationType.PostMention,
      notificationMsg: 'had mentioned you in a post',
    };

    const notification = await notificationsService.create(notificationObj);

    const socketListenPromise = new Promise<void>((resolve) => {
      client.on('notificationReceived', (...args) => {
        expect(JSON.stringify(args[0])).toBe(JSON.stringify({ notification }));
        resolve();
      });
    });

    // Make request that will trigger emitted event
    notificationsGateway.emitMessageForNotification(notification);

    // Await socket response to receive emitted event
    await socketListenPromise;

    client.close();

    // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
    await waitForSocketUserCleanup(client, usersService);
  });
});
