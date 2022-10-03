import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { createTempFiles } from '../../helpers/tempfile-helpers';
import { User } from '../../../src/schemas/user/user.schema';

describe('Feed-Post / Post File (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();
  });

  describe('POST /feed-posts', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
    });
    it('SuccessFully create feed posts', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .set('Connection', 'keep-alive')
          .field('message', 'hello test user')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .attach('files', tempPaths[2])
          .attach('files', tempPaths[3])
          .expect(HttpStatus.CREATED);
        expect(response.body.message).toBe('hello test user');
      }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);
    });

    it('responds expected response when file is not jpg, jpeg or png', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .set('Connection', 'keep-alive')
          .field('message', 'hello test user')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .attach('files', tempPaths[2])
          .attach('files', tempPaths[3]);
        expect(response.body.message).toBe('Invalid file type');
      }, [{ extension: 'zpng' }, { extension: 'tjpg' }, { extension: 'tjpg' }, { extension: 'zpng' }]);
    });

    it('responds expected response when file is not present in request', async () => {
        const response = await request(app.getHttpServer())
          .post('/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('message', '');
          expect(response.body.message).toBe('Posts must have a message or at least one image. No message or image received.');
    });

    it('only allow a maximum of four images', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .set('Connection', 'keep-alive')
          .field('message', 'hello test user')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .attach('files', tempPaths[2])
          .attach('files', tempPaths[3])
          .attach('files', tempPaths[4]);
        expect(response.body.message).toBe('Only allow a maximum of 4 images');
      }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }, { extension: 'png' }]);
    });

    it('responds expected response if file size should not larger than 20MB', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .set('Connection', 'keep-alive')
          .field('message', 'hello test user')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1]);
        expect(response.body.message).toBe('File too large');
      }, [{ extension: 'png' }, { extension: 'jpg', size: 1024 * 1024 * 21 }]);
    });

    it('check file exists or not in req body', async () => {
        const response = await request(app.getHttpServer())
          .post('/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .set('Connection', 'keep-alive')
          .field('message', 'hello test user')
          .field('userId', activeUser._id.toString());
        expect(response.body.message).toBe('Please upload a file');
    });

    it('check message length validation', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .set('Connection', 'keep-alive')
          .field('message', new Array(1002).join('z'))
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1]);
        expect(response.body.message).toContain('message cannot be longer than 1000 characters');
      }, [{ extension: 'png' }, { extension: 'jpg' }]);
    });
  });
});
