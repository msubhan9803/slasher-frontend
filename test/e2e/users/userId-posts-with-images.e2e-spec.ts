import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { FeedPost } from '../../../src/schemas/feedPost/feedPost.schema';

describe('UserId Posts With Images (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let feedPost: FeedPost;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

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
    await connection.dropDatabase();

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    for (let i = 0; i < 10; i += 1) {
      await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser._id,
        }),
      );
    }
  });

  describe('UserId Posts With Images Details', () => {
    it('when earlier than post id is not exist then expected feed post response', async () => {
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/users/${activeUser._id}/posts-with-images?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      for (let i = 1; i < response.body.length; i += 1) {
        expect(response.body[i].createdAt < response.body[i - 1].createdAt).toBe(true);
        expect(response.body[i].images.length).toBeGreaterThan(0);
      }
      expect(response.body).toHaveLength(10);
    });
  });

  describe('when `before` argument is supplied', () => {
    it('get expected first and second sets of paginated results', async () => {
      const limit = 6;
      const firstResponse = await request(app.getHttpServer())
        .get(`/users/${activeUser._id}/posts-with-images?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(firstResponse.status).toEqual(HttpStatus.OK);
      expect(firstResponse.body).toHaveLength(6);

      const secondResponse = await request(app.getHttpServer())
        .get(`/users/${activeUser._id}/posts-with-images?limit=${limit}&before=${firstResponse.body[limit - 1]._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(secondResponse.status).toEqual(HttpStatus.OK);
      expect(secondResponse.body).toHaveLength(4);
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser._id}/posts-with-images`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        feedPost = await feedPostsService.create(
          feedPostFactory.build(
            {
              userId: activeUser._id,
            },
          ),
        );
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser._id}/posts-with-images?limit=${limit}&before=${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('before should be a valid ObjectId', async () => {
        feedPost = await feedPostsService.create(
          feedPostFactory.build(
            {
              userId: activeUser._id,
            },
          ),
        );
        const limit = 6;
        const beforeId = `a_${feedPost._id}`;
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser._id}/posts-with-images?limit=${limit}&before=${beforeId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('before must be a mongodb id');
      });
    });
  });
});
