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
import { clearDatabase } from '../../helpers/mongo-helpers';
import { FeedPostDocument } from '../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';

describe('Feed-Comments / Comments File (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPost: FeedPostDocument;
  let feedPostsService: FeedPostsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  describe('POST /feed-comments', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
      feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
          },
        ),
      );
    });

    it('successfully creates feed comments with a message and files', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')

          .field('feedPostId', feedPost._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .attach('images', tempPaths[2])
          .attach('images', tempPaths[3])
          .expect(HttpStatus.CREATED);
        expect(response.body.message).toBe('hello test user');
      }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);
    });

    it('responds expected response when one or more uploads files user an unallowed extension', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')

          .field('feedPostId', feedPost._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .attach('images', tempPaths[2])
          .attach('images', tempPaths[3])
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Invalid file type');
      }, [{ extension: 'png' }, { extension: 'tjpg' }, { extension: 'tjpg' }, { extension: 'zpng' }]);
    });

    it('allows the creation of a comments with only a message, but no files', async () => {
      const message = 'This is a test message';
      const response = await request(app.getHttpServer())
        .post('/feed-comments')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', message)
        .field('feedPostId', feedPost._id.toString())
        .expect(HttpStatus.CREATED);
      expect(response.body.message).toBe(message);
    });

    it('allows the creation of a comments with only files, but no message', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')

          .field('feedPostId', feedPost._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1]);
        expect(response.body.message).toContain('message should not be empty');
      }, [{ extension: 'png' }, { extension: 'jpg' }]);
    });

    it('only allows a maximum of four images', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')

          .field('feedPostId', feedPost._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .attach('images', tempPaths[2])
          .attach('images', tempPaths[3])
          .attach('images', tempPaths[4])
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Only allow a maximum of 4 images');
      }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }, { extension: 'png' }]);
    });

    it('responds expected response if file size should not larger than 20MB', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')

          .field('feedPostId', feedPost._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .expect(HttpStatus.PAYLOAD_TOO_LARGE);
        expect(response.body.message).toBe('File too large');
      }, [{ extension: 'png' }, { extension: 'jpg', size: 1024 * 1024 * 21 }]);
    });

    it('check message length validation', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/feed-comments')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', new Array(8002).join('z'))

          .field('feedPostId', feedPost._id.toString())
          .attach('images', tempPaths[0])
          .attach('images', tempPaths[1])
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('message cannot be longer than 8,000 characters');
      }, [{ extension: 'png' }, { extension: 'jpg' }]);
    });

    it('returns the expected error response if the post cannot be found', async () => {
      const nonExistentPostId = '239ae2550dae24b30c70f6c7';
      const response = await request(app.getHttpServer())
        .post('/feed-comments')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', 'Hello')
        .field('feedPostId', nonExistentPostId)
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body.message).toContain('Post not found');
    });
  });
});
