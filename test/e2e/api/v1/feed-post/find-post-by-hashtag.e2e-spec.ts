import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { HashtagService } from '../../../../../src/hashtag/providers/hashtag.service';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';

describe('Feed-Post / Find Post By Hashtag (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let hashtagService: HashtagService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    hashtagService = moduleRef.get<HashtagService>(HashtagService);

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let user4;
  let user5;
  let user6;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
    activeUser = await usersService.create(userFactory.build());
    await hashtagService.createOrUpdateHashtags(['ok']);
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    //create private user
    const user2 = await usersService.create(userFactory.build({
      profile_status: 1,
    }));

    //create public user with deleted
    const user3 = await usersService.create(userFactory.build({
      profile_status: 0, deleted: true,
    }));

    //create 3 public users with not deleted
    user4 = await usersService.create(userFactory.build({
      profile_status: 0,
    }));
    user5 = await usersService.create(userFactory.build({
      profile_status: 0,
    }));
    user6 = await usersService.create(userFactory.build({
      profile_status: 0,
    }));

    //create posts with public user5 or user6
    await feedPostsService.create(
      feedPostFactory.build({
        message: 'post #ok #good',
        userId: user5.id,
        hashtags: ['ok', 'good'],
      }),
    );
    await feedPostsService.create(
      feedPostFactory.build({
        message: 'post #ok #code',
        userId: user6.id,
        hashtags: ['ok', 'code'],
      }),
    );

    //create posts with private user2 or deleted public user3
    await feedPostsService.create(
      feedPostFactory.build({
        message: 'post #ok #buddy',
        userId: user2.id,
        hashtags: ['ok', 'buddy'],
      }),
    );
    await feedPostsService.create(
      feedPostFactory.build({
        message: 'post #code #flash',
        userId: user3.id,
        hashtags: ['code', 'flash'],
      }),
    );

    //create posts with public user4 but #ok is not exists
    await feedPostsService.create(
      feedPostFactory.build({
        message: 'post#fan #follow',
        userId: user4.id,
        hashtags: ['fan', 'follow'],
      }),
    );
  });

  describe('GET /api/v1/feed-posts/hashtag/:hashtag', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/feed-posts/hashtag/:hashtag').expect(HttpStatus.UNAUTHORIZED);
    });

    it('when hashtag is "ok" returns the expected feed post response', async () => {
      const limit = 5;
      const hashtag = 'ok';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-posts/hashtag/${hashtag}?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      for (let i = 1; i < response.body.length; i += 1) {
        expect(response.body[i].createdAt < response.body[i - 1].createdAt).toBe(true);
      }

      expect(response.body).toEqual(
        {
          count: 2,
          posts: [
            {
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              message: 'post #ok #code',
              createdAt: expect.any(String),
              lastUpdateAt: expect.any(String),
              rssfeedProviderId: null,
              images: [
                {
                  image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                  _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                  description: 'this is test description',
                },
                {
                  image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                  _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                  description: 'this is test description',
                },
              ],
              userId: {
                _id: user6.id,
                profilePic: expect.any(String),
                userName: 'Username6',
              },
              commentCount: 0,
              likeCount: 0,
              likedByUser: false,
            },
            {
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              message: 'post #ok #good',
              createdAt: expect.any(String),
              lastUpdateAt: expect.any(String),
              rssfeedProviderId: null,
              images: [
                {
                  image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                  _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                  description: 'this is test description',
                },
                {
                  image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
                  _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                  description: 'this is test description',
                },
              ],
              userId: {
                _id: user5.id,
                profilePic: expect.any(String),
                userName: 'Username5',
              },
              commentCount: 0,
              likeCount: 0,
              likedByUser: false,
            },
          ],
        },
      );
    });

    describe('when `before` argument is supplied', () => {
      beforeEach(async () => {
        await feedPostsService.create(
          feedPostFactory.build({
            message: 'post #ok #good',
            userId: user5.id,
            hashtags: ['ok', 'good'],
          }),
        );
        await feedPostsService.create(
          feedPostFactory.build({
            message: 'post #ok #code',
            userId: user6.id,
            hashtags: ['ok', 'code'],
          }),
        );
        await feedPostsService.create(
          feedPostFactory.build({
            message: 'post #ok #code',
            userId: user4.id,
            hashtags: ['ok', 'code'],
          }),
        );
      });
      it('get expected first and second sets of paginated results', async () => {
        const limit = 3;
        const hashtag = 'ok';
        const firstResponse = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/hashtag/${hashtag}?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();

        expect(firstResponse.body.posts).toHaveLength(3);
        for (let index = 1; index < firstResponse.body.posts.length; index += 1) {
          expect(firstResponse.body.posts[index].createdAt < firstResponse.body.posts[index - 1].createdAt).toBe(true);
        }

        const secondResponse = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/hashtag/${hashtag}?limit=${limit}&before=${firstResponse.body.posts[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();

        expect(secondResponse.body.posts).toHaveLength(2);
        for (let index = 1; index < secondResponse.body.posts.length; index += 1) {
          expect(secondResponse.body.posts[index].createdAt < secondResponse.body.posts[index - 1].createdAt).toBe(true);
        }
      });

      it('when hashtag is not exists', async () => {
        const limit = 5;
        const hashtag = 'best';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/hashtag/${hashtag}?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toBe('Hashtag not found');
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const hashtag = 'ok';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/hashtag/${hashtag}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const hashtag = 'ok';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/hashtag/${hashtag}?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 30', async () => {
        const limit = 31;
        const hashtag = 'ok';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/hashtag/${hashtag}?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 30');
      });

      it('`before` must match regular expression', async () => {
        const limit = 3;
        const hashtag = 'ok';
        const before = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/hashtag/${hashtag}?limit=${limit}&before=${before}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain(
          'before must be a mongodb id',
        );
      });
    });
  });
});
