import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { FeedPost } from '../../../../../src/schemas/feedPost/feedPost.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('UserId Posts With Images (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let feedPost: FeedPost;
  let blocksModel: Model<BlockAndUnblockDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();

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

      await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser._id,
          images: [],
        }),
      );
    }
  });

  // When `before` argument is not supplied
  describe('GET /api/v1/users/:userId/posts-with-images?limit=', () => {
    it('requires authentication', async () => {
      const userId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).get(`/api/v1/users/${userId}/posts-with-images`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('when earlier than post id is not exist then expected feed post response', async () => {
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${activeUser._id.toString()}/posts-with-images?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(10);
      for (let i = 1; i < response.body.length; i += 1) {
        expect(response.body[i].createdAt < response.body[i - 1].createdAt).toBe(true);
        const postFromResponse = response.body[i];
        expect(postFromResponse).toEqual(
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            createdAt: expect.any(String),
            images: [
              {
                image_path: 'http://localhost:4444/api/v1/local-storage/feed/feed_sample1.jpg',
                description: 'this is test description',
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              },
              {
                image_path: 'http://localhost:4444/api/v1/local-storage/feed/feed_sample1.jpg',
                description: 'this is test description',
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              },
            ],
          },
        );
      }
    });
    it('when user is block than expected response.', async () => {
      const user1 = await usersService.create(userFactory.build());
      await blocksModel.create({
        from: activeUser._id,
        to: user1._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const limit = 3;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${user1._id}/friends?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual({
        message: 'User not found',
        statusCode: 404,
      });
    });
  });

  describe('when `before` argument is supplied', () => {
    it('get expected first and second sets of paginated results', async () => {
      const limit = 6;
      const firstResponse = await request(app.getHttpServer())
        .get(`/api/v1/users/${activeUser._id.toString()}/posts-with-images?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(firstResponse.status).toEqual(HttpStatus.OK);
      expect(firstResponse.body).toHaveLength(6);

      const secondResponse = await request(app.getHttpServer())
        .get(`/api/v1/users/${activeUser._id.toString()}/posts-with-images?limit=${limit}&before=${firstResponse.body[limit - 1]._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(secondResponse.status).toEqual(HttpStatus.OK);
      expect(secondResponse.body).toHaveLength(4);
    });

    it('denies access when requesting posts with images for a non-friend user with a non-public profile', async () => {
      const user = await usersService.create(userFactory.build({
        profile_status: ProfileVisibility.Private,
      }));
      await feedPostsService.create(
        feedPostFactory.build({
          userId: user._id,
        }),
      );
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${user._id}/posts?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.FORBIDDEN);
      expect(response.body.message).toContain('You must be friends with this user to perform this action.');
    });

    describe('Validation', () => {
      it('userId must be a mongodb id', async () => {
        const userId = 'not-a-mongo-id';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${userId}/posts-with-images?limit=10`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId must be a mongodb id',
        );
      });

      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser._id.toString()}/posts-with-images`)
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
          .get(`/api/v1/users/${activeUser._id.toString()}/posts-with-images?limit=${limit}&before=${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 30', async () => {
        feedPost = await feedPostsService.create(
          feedPostFactory.build(
            {
              userId: activeUser._id,
            },
          ),
        );
        const limit = 31;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser._id.toString()}/posts-with-images?limit=${limit}&before=${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 30');
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
          .get(`/api/v1/users/${activeUser._id.toString()}/posts-with-images?limit=${limit}&before=${beforeId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('before must be a mongodb id');
      });
    });
  });
});
