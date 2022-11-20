import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io } from 'socket.io-client';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { userFactory } from '../../factories/user.factory';
import { UsersService } from '../../../src/users/providers/users.service';
import { RedisIoAdapter } from '../../../src/adapters/redis-io.adapter';
import { dropCollections } from '../../helpers/mongo-helpers';

describe('Chat Gateway (e2e)', () => {
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
    // const redisIoAdapter = new RedisIoAdapter(app, configService);
    // await redisIoAdapter.connectToRedis();
    // app.useWebSocketAdapter(redisIoAdapter);

    // For socket tests, we use app.listen() instead of app.init()
    await app.listen(configService.get<number>('PORT'));
    baseAddress = `http://localhost:${configService.get<number>('PORT')}`;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await dropCollections(connection);

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  it('should properly handle a chatTest event', async () => {
    const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });

    const payload = { senderId: '6359fbc11577d660fb284650', receiverId: '6359fbc11577d660fb284653', message: 'This is a test message' };
    await new Promise<void>((resolve) => {
      client.emit('chatTest', payload, (data) => {
        expect(data).toBe(`chat message from ${payload.senderId} to ${payload.receiverId}: ${payload.message}`);
        resolve();
      });
    });

    client.close();
  });
});
