import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { io } from 'socket.io-client';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { createTempFiles } from '../../helpers/tempfile-helpers';
import { User } from '../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { Notification, NotificationDocument } from '../../../src/schemas/notification/notification.schema';
import { waitForAuthSuccessMessage, waitForSocketUserCleanup } from '../../helpers/gateway-test-helpers';

describe('Feed-Post / Post File (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let user1: User;
  let configService: ConfigService;
  let baseAddress: string;
  let notificationModel: Model<NotificationDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    notificationModel = moduleRef.get<Model<NotificationDocument>>(getModelToken(Notification.name));

    app = moduleRef.createNestApplication();
    await app.init();
    await app.listen(configService.get<number>('PORT'));
    baseAddress = `http://localhost:${configService.get<number>('PORT')}`;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  describe('POST /feed-posts', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      user1 = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
    });

    it('successfully creates feed posts with a message and files', async () => {
      const user1AuthToken = user1.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
      const client = io(baseAddress, { auth: { token: user1AuthToken }, transports: ['websocket'] });
      await waitForAuthSuccessMessage(client);

      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', `hello test user ##LINK_ID##${user1._id.toString()}@${user1.userName}##LINK_END##`)
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .attach('files', tempPaths[2])
          .attach('files', tempPaths[3])
          .expect(HttpStatus.CREATED);

        expect(response.body.message).toBe(`hello test user ##LINK_ID##${user1._id.toString()}@${user1.userName}##LINK_END##`);

        const notification = await notificationModel.findOne({ userId: user1._id });

        const socketListenPromise = new Promise<void>((resolve) => {
          client.on('notificationReceived', (...args) => {
            console.log('args =', JSON.stringify(args[0]));
            console.log('notification =', JSON.stringify({ notification }));
            expect(JSON.stringify(args[0])).toBe(JSON.stringify({ notification }));
            resolve();
          });
        });

        await socketListenPromise;

        client.close();

        // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
        await waitForSocketUserCleanup(client, usersService);
      }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);
    });

    it('responds expected response when one or more uploads files user an unallowed extension', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .attach('files', tempPaths[2])
          .attach('files', tempPaths[3])
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Invalid file type');
      }, [{ extension: 'png' }, { extension: 'tjpg' }, { extension: 'tjpg' }, { extension: 'zpng' }]);
    });

    it('allows the creation of a post with only a message, but no files', async () => {
      const message = 'This is a test message';
      const response = await request(app.getHttpServer())
        .post('/feed-posts')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', message)
        .field('userId', activeUser._id.toString())
        .expect(HttpStatus.CREATED);
      expect(response.body.message).toBe(message);
    });

    it('allows the creation of a post with only files, but no message', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .expect(HttpStatus.CREATED);
        expect(response.body.images).toHaveLength(2);
      }, [{ extension: 'png' }, { extension: 'jpg' }]);
    });

    it('responds expected response when neither message nor file are present in request', async () => {
      const response = await request(app.getHttpServer())
        .post('/feed-posts')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('message', '')
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe('Posts must have a message or at least one image. No message or image received.');
    });

    it('only allows a maximum of four images', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .attach('files', tempPaths[2])
          .attach('files', tempPaths[3])
          .attach('files', tempPaths[4])
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Only allow a maximum of 4 images');
      }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }, { extension: 'png' }]);
    });

    it('responds expected response if file size should not larger than 20MB', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .expect(HttpStatus.PAYLOAD_TOO_LARGE);
        expect(response.body.message).toBe('File too large');
      }, [{ extension: 'png' }, { extension: 'jpg', size: 1024 * 1024 * 21 }]);
    });

    it('check message length validation', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', new Array(1002).join('z'))
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('message cannot be longer than 1000 characters');
      }, [{ extension: 'png' }, { extension: 'jpg' }]);
    });
  });
});
