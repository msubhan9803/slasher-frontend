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
import { rewindAllFactories } from '../helpers/factory-helpers.ts';
import { FriendsService } from '../../src/friends/providers/friends.service';
import { FriendsGateway } from '../../src/friends/providers/friends.gateway';
import { SIMPLE_MONGODB_ID_REGEX } from '../../src/constants';

describe('Friends Gateway (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let configService: ConfigService;
  let baseAddress: string;
  let activeUser: UserDocument;
  let user0: UserDocument;
  let activeUserAuthToken: string;
  let friendsService: FriendsService;
  let friendsGateway: FriendsGateway;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    friendsGateway = moduleRef.get<FriendsGateway>(FriendsGateway);

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
    user0 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('#clearNewFriendRequestCount', () => {
    it('when clean new friend request count', async () => {
      const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
      await waitForAuthSuccessMessage(client);

      const response = await new Promise<any>((resolve) => {
        client.emit('clearNewFriendRequestCount', (data) => {
          resolve(data);
        });
      });
      client.close();

      expect(response).toEqual({ newFriendRequestCount: 0 });
      // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
      await waitForSocketUserCleanup(client, usersService);
    });
  });

  describe('#friendRequestReceived', () => {
    it('FriendsService#createFriendRequest calls friendRequestReceived, which emits the expected socket', async () => {
      const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
      await waitForAuthSuccessMessage(client);

      const user0AuthToken = user0.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));
      const receiverClient = io(baseAddress, { auth: { token: user0AuthToken }, transports: ['websocket'] });
      await waitForAuthSuccessMessage(receiverClient);

      const friend = await friendsService.createFriendRequest(activeUser.id, user0.id);
      await friendsGateway.emitFriendRequestReceivedEvent(friend.to.toString());

      let receivedPayload;
      const socketListenPromise = new Promise<void>((resolve) => {
        receiverClient.on('friendRequestReceived', (...args) => {
          // NOTE: Avoid calling expect() method inside of the on() method, or the test will hang
          // if expect() comparison fails.
          [receivedPayload] = args;
          resolve();
        });
      });

      // Await socket response to receive emitted event
      await socketListenPromise;

      client.close();
      receiverClient.close();

      // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
      await waitForSocketUserCleanup(client, usersService);
      await waitForSocketUserCleanup(receiverClient, usersService);

      expect(receivedPayload).toEqual({
        pendingFriendRequestCount: 1,
        recentFriendRequests: [{
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          userName: 'Username1',
          profilePic: expect.any(String),
          firstName: 'First name 1',
          createdAt: expect.any(String),
        }],
        // friend: {
        //   _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        //   from: activeUser.id,
        //   to: user0.id,
        //   reaction: FriendRequestReaction.Pending,
        // },
      });
    });
  });
});
