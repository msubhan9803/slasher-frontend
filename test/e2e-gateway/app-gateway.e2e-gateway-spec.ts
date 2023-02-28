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

describe('App Gateway (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let configService: ConfigService;
  let baseAddress: string;
  let activeUser: UserDocument;
  let activeUserAuthToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);

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
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('App gateway authentication requirement', () => {
    it('when an auth token is not provided, it connects and then disconnects', async () => {
      const client = io(baseAddress, { transports: ['websocket'] });

      // Before connection, expect connected === false
      expect(client.connected).toBe(false);

      let connected = false;
      let disconnected = false;

      await Promise.all([
        new Promise<void>((resolve) => {
          // After connect event, expect connection === true
          client.on('connect', () => {
            expect(client.connected).toBe(true);
            connected = true;
            resolve();
          });
        }),
        new Promise<void>((resolve) => {
          // After disconnect event, expect connection === false
          client.on('disconnect', () => {
            expect(client.connected).toBe(false);
            disconnected = true;
            resolve();
          });
        }),
      ]);

      // Ensure that we received a connection event AND a disconnect event
      expect(connected).toBeTruthy();
      expect(disconnected).toBeTruthy();

      expect(client.connected).toBe(false);

      // Although the client shouldn't be connected, disconnect just to be safe (in case
      // a code change breaks this test later on).
      if (client.connected) { client.close(); }

      // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
      await waitForSocketUserCleanup(client, usersService);
    });

    it('when a valid auth token is provided, it connects and can successfully send/receive', async () => {
      const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
      await waitForAuthSuccessMessage(client);

      await new Promise<void>((resolve) => {
        client.emit('ping', {}, (data) => {
          expect(data).toBe('pong');
          resolve();
        });
      });

      // Expect client to be connected
      expect(client.connected).toBe(true);

      await client.close();

      // Expect client to be disconnected
      expect(client.connected).toBe(false);

      // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
      await waitForSocketUserCleanup(client, usersService);
    });
  });
});
