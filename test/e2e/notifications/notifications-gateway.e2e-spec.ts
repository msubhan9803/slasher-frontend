import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { io } from 'socket.io-client';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { userFactory } from '../../factories/user.factory';
import { UsersService } from '../../../src/users/providers/users.service';
import { User } from '../../../src/schemas/user/user.schema';

describe('Notifications Gateway (e2e)', () => {
  let app: INestApplication;
  let client: any; // TODO: Make this more specific
  let activeUser: User;
  let activeUserAuthToken: string;
  let usersService: UsersService;
  let configService: ConfigService;
  let connection: Connection;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    connection = await moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);

    const address = app.getHttpServer().listen().address();
    const baseAddress = `http://[${address.address}]:${address.port}`;
    client = io(baseAddress);
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();

    activeUser = await usersService.create(
      userFactory.build(),
    );
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  afterAll(async () => {
    client.close();
    await app.close();
  });

  describe('Notifications gateway test', () => {
    it('should connect successfully and acknowledge event', async () => {
      const outboundPayload = { message: 'test' };
      await new Promise<void>((resolve) => {
        client.emit('getNotifications', outboundPayload, (data) => {
          expect(data).toBe(`getNotifications response.  received: ${outboundPayload.message}`);
          resolve();
        });
      });
    });

    it('a client should receive an event when a request is made to the /notifications/test endpoint', async () => {
      const socketListenPromise = new Promise<void>((resolve) => {
        client.once('hello', (...args) => {
          // eslint-disable-next-line no-console
          console.log(args); // TODO: delete this line when debugging is finished
          expect(args[0]).toBe('world');
          resolve();
        });
      });

      // Make request that will trigger emitted event
      await request(app.getHttpServer())
        .post('/notifications/test')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .expect(HttpStatus.CREATED)
        .expect('test');

      // Await socket response to receive emitted event
      await socketListenPromise;
    });
  });
});
