import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { createTempFile } from '../../helpers/tempfile-helpers';
import { LocalStorageService } from '../../../src/local-storage/providers/local-storage.service';
import { FeedPostsService } from '../../../src/feed-post/providers/feed-post.service';
import { User } from '../../../src/schemas/user/user.schema';

describe('Feed-Post / Post File (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let localStorageService: LocalStorageService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    localStorageService = moduleRef.get<LocalStorageService>(LocalStorageService);
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
      const obj = {}
      for (let i = 0; i < 4; i += 1) {
      await createTempFile(async (tempPath) => {
        const response = await request(app.getHttpServer())
          .post('/feed-post')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', "hello test user")
          .attach('file', tempPath)
          .expect(HttpStatus.CREATED);
          console.log("responseBodyyy", response.body);
      }, { extension: 'png' });
    }
    });
  });
});
