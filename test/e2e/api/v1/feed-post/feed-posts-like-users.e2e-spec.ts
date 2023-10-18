/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { FeedLikesService } from '../../../../../src/feed-likes/providers/feed-likes.service';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { RssFeedProviderFollowsService } from '../../../../../src/rss-feed-provider-follows/providers/rss-feed-provider-follows.service';
import { RssFeedProvidersService } from '../../../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { BlockAndUnblockDocument, BlockAndUnblock } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { FeedPostDocument } from '../../../../../src/schemas/feedPost/feedPost.schema';
import { RssFeedProvider } from '../../../../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { rssFeedProviderFactory } from '../../../../factories/rss-feed-providers.factory';
import { userFactory } from '../../../../factories/user.factory';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';
import { FriendsService } from '../../../../../src/friends/providers/friends.service';

describe('Feed-Post / Feed Post Like Users (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let user1: UserDocument;
  let user2: UserDocument;
  let user3: UserDocument;
  let rssFeedProviderData: RssFeedProvider;
  let blocksModel: Model<BlockAndUnblockDocument>;
  let rssFeedProviderFollowsService: RssFeedProviderFollowsService;
  let rssFeedProvidersService: RssFeedProvidersService;
  let feedPost: FeedPostDocument;
  let feedLikesService: FeedLikesService;
  let friendsService: FriendsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    rssFeedProviderFollowsService = moduleRef.get<RssFeedProviderFollowsService>(RssFeedProviderFollowsService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    feedLikesService = moduleRef.get<FeedLikesService>(FeedLikesService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);

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
    user1 = await usersService.create(userFactory.build());
    user2 = await usersService.create(userFactory.build());
    user3 = await usersService.create(userFactory.build());
    rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build());

    // make user1 friend
    await friendsService.createFriendRequest(activeUser._id.toString(), user1._id.toString());
    await friendsService.acceptFriendRequest(activeUser._id.toString(), user1._id.toString());
    // make user2 friend
    await friendsService.createFriendRequest(user2._id.toString(), activeUser._id.toString());
    await friendsService.acceptFriendRequest(user2._id.toString(), activeUser._id.toString());

    await rssFeedProviderFollowsService.create(
      {
        userId: activeUser._id,
        rssfeedProviderId: rssFeedProviderData._id,
      },
    );
    feedPost = await feedPostsService.create(
      feedPostFactory.build({
        userId: activeUser._id,
      }),
    );

    // Create 3 feedPostLike by the user itself, user1, user2
    await feedLikesService.createFeedPostLike(feedPost.id, activeUser.id);
    await feedLikesService.createFeedPostLike(feedPost.id, user1.id);
    await feedLikesService.createFeedPostLike(feedPost.id, user2.id);
  });

  // Find Feed Post Like Users
  describe('GET /api/v1/feed-posts/:feedPostId/likes', () => {
    it('requires authentication', async () => {
      const feedPostId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).get(`/api/v1/feed-posts/${feedPostId}/likes`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns the expected feed post response', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-posts/${feedPost.id}/likes?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([
        {
          _id: activeUser.id,
          userName: activeUser.userName,
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          firstName: activeUser.firstName,
          friendship: null,
        },
        {
          _id: user1.id,
          userName: user1.userName,
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          firstName: user1.firstName,
          friendship: {
            reaction: 3,
            from: activeUser.id,
            to: user1.id,
          },
        },
        {
          _id: user2.id,
          userName: user2.userName,
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          firstName: user2.firstName,
          friendship: {
            reaction: 3,
            from: user2.id,
            to: activeUser.id,
          },
        },
      ]);
    });

    describe('when `offset` argument is supplied', () => {
      beforeEach(async () => {
        // Create 4th like by `user3`
        await feedLikesService.createFeedPostLike(feedPost.id, user3._id.toString());
      });
      it('get expected first and second sets of paginated results', async () => {
        const limit = 2;
        const firstResponse = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${feedPost.id}/likes?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.body).toHaveLength(2);
        expect(firstResponse.body).toEqual([
          {
            _id: activeUser.id,
            userName: activeUser.userName,
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            firstName: activeUser.firstName,
            friendship: null,
          },
          {
            _id: user1.id,
            userName: user1.userName,
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            firstName: user1.firstName,
            friendship: {
              reaction: 3,
              from: activeUser.id,
              to: user1.id,
            },
          },
        ]);

        const secondResponse = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${feedPost.id}/likes?limit=${limit}&offset=2`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.body).toHaveLength(2);
        expect(secondResponse.body).toEqual([
          {
            _id: user2.id,
            userName: user2.userName,
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            firstName: user2.firstName,
            friendship: {
              reaction: 3,
              from: user2.id,
              to: activeUser.id,
            },
          },
          {
            _id: user3.id,
            userName: user3.userName,
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            firstName: user3.firstName,
            friendship: null,
          },
        ]);
      });
    });

    describe('should expected response when no likes exists for the given post', () => {
      let feedPostNotLiked;
      beforeEach(async () => {
        feedPostNotLiked = await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser._id,
            rssfeedProviderId: rssFeedProviderData._id,
          }),
        );
      });

      it('return empty array when no likes exists found for the given `feedpost`', async () => {
        const limit = 2;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${feedPostNotLiked.id}/likes?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([]);
      });
    });

    it('when user is block than expected response.', async () => {
      const post = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: user1._id,
          },
        ),
      );
      await blocksModel.create({
        from: activeUser._id.toString(),
        to: user1._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-posts/${post.id}/likes?limit=5`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Request failed due to user block.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    });

    it('returns the expected response when profile status is not public and requesting user is not a friend of post creator', async () => {
      const user = await usersService.create(userFactory.build({
        profile_status: ProfileVisibility.Private,
      }));
      const post = await feedPostsService.create(
        feedPostFactory.build({
          userId: user._id,
        }),
      );
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-posts/${post.id}/likes?limit=5`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual({ statusCode: 403, message: 'You must be friends with this user to perform this action.' });
    });

    it('when post has an rssfeedProviderId, it returns a successful response', async () => {
      const rssFeedProvider = await rssFeedProvidersService.create(rssFeedProviderFactory.build());

      const post = await feedPostsService.create(
        feedPostFactory.build({
          userId: rssFeedProvider._id,
          rssfeedProviderId: rssFeedProvider._id,
        }),
      );

      // Create 3 feedPostLike by the user itself, user1, user2
      await feedLikesService.createFeedPostLike(post.id, activeUser.id);
      await feedLikesService.createFeedPostLike(post.id, user1.id);
      await feedLikesService.createFeedPostLike(post.id, user2.id);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-posts/${post.id}/likes?limit=5`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([
        {
          _id: activeUser.id,
          userName: activeUser.userName,
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          firstName: activeUser.firstName,
          friendship: null,
        },
        {
          _id: user1.id,
          userName: user1.userName,
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          firstName: user1.firstName,
          friendship: {
            reaction: 3,
            from: activeUser.id,
            to: user1.id,
          },
        },
        {
          _id: user2.id,
          userName: user2.userName,
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          firstName: user2.firstName,
          friendship: {
            reaction: 3,
            from: user2.id,
            to: activeUser.id,
          },
        },
      ]);
    });

    describe('Validation', () => {
      it('id must be a mongodb id', async () => {
        const feedPostId = 'not-a-mongo-id';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${feedPostId}/likes?limit=${10}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'id must be a mongodb id',
        );
      });

      it('return expected response when feed post not found', async () => {
        const nonExistingFeedPostId = new mongoose.Types.ObjectId().toString();
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${nonExistingFeedPostId}/likes?limit=${10}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toBe('Post not found');
      });

      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${feedPost.id}/likes`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          statusCode: 400,
          message: [
            'limit must not be greater than 30',
            'limit must be a number conforming to the specified constraints',
            'limit should not be empty',
          ],
          error: 'Bad Request',
        });
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${feedPost.id}/likes?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toEqual([
          'limit must not be greater than 30',
          'limit must be a number conforming to the specified constraints',
        ]);
      });

      it('limit should not be greater than 30', async () => {
        const limit = 31;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${feedPost.id}/likes?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: ['limit must not be greater than 30'],
          statusCode: 400,
        });
      });

      it('`offset` must be number', async () => {
        const limit = 3;
        const offset = 'abc';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-posts/${feedPost.id}/likes?limit=${limit}&offset=${offset}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          statusCode: 400,
          message: ['offset must be a number conforming to the specified constraints'],
        });
      });
    });
  });
});
