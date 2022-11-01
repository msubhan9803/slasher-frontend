import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { io } from 'socket.io-client';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import * as request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { userFactory } from '../../factories/user.factory';
import { UsersService } from '../../../src/users/providers/users.service';

describe('Notifications Gateway (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let configService: ConfigService;
  let address: any;
  let baseAddress: string;
  let activeUser: UserDocument;
  let activeUserAuthToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);

    app = moduleRef.createNestApplication();
    await app.init();

    address = app.getHttpServer().listen().address();
    baseAddress = `http://[${address.address}]:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();

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
