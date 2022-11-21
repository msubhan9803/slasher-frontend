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

// Setting a longer timeout for this file because these tests can run slowly in the CI environment
jest.setTimeout(20_000);

describe('Notifications Gateway (e2e)', () => {
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

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  it('should properly handle a getNotifications event', async () => {
    const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });

    const payload = { message: 'test' };
    await new Promise<void>((resolve) => {
      client.emit('getNotifications', payload, (data) => {
        expect(data).toBe(`getNotifications response.  received: ${payload.message}`);
        resolve();
      });
    });

    client.close();
  });

  it('a client should receive an event when a request is made to the /notifications/socket-test endpoint', async () => {
    const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });

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
  });
});
