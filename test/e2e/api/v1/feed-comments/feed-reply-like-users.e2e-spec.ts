/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { FeedPostDocument } from '../../../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { NotificationsService } from '../../../../../src/notifications/providers/notifications.service';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';
import { RssFeedProvidersService } from '../../../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { rssFeedProviderFactory } from '../../../../factories/rss-feed-providers.factory';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { feedCommentsFactory } from '../../../../factories/feed-comments.factory';
import { FeedCommentsService } from '../../../../../src/feed-comments/providers/feed-comments.service';
import { FeedLikesService } from '../../../../../src/feed-likes/providers/feed-likes.service';
import { FriendsService } from '../../../../../src/friends/providers/friends.service';
import { RssFeedProviderFollowsService } from '../../../../../src/rss-feed-provider-follows/providers/rss-feed-provider-follows.service';
import { RssFeedProvider } from '../../../../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { FeedCommentDocument } from '../../../../../src/schemas/feedComment/feedComment.schema';
import { feedRepliesFactory } from '../../../../factories/feed-reply.factory';
import { FeedReplyDocument } from '../../../../../src/schemas/feedReply/feedReply.schema';

describe('Feed-Comments / Likes Users of Comment  (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let user0: User;
  let user1: User;
  let user2: User;
  let rssFeedProviderData: RssFeedProvider;
  let configService: ConfigService;
  let feedPost: FeedPostDocument;
  let feedPostsService: FeedPostsService;
  let feedComment: FeedCommentDocument;
  let feedReply: FeedReplyDocument;
  let notificationsService: NotificationsService;
  let blocksModel: Model<BlockAndUnblockDocument>;
  let rssFeedProvidersService: RssFeedProvidersService;
  let feedCommentsService: FeedCommentsService;
  let feedLikesService: FeedLikesService;
  let friendsService: FriendsService;
  let rssFeedProviderFollowsService: RssFeedProviderFollowsService;

  const feedCommentsAndReplyObject = {
    images: [
      {
        image_path: '/feed/feed_sample1.jpg',
      },
      {
        image_path: '/feed/feed_sample2.jpg',
      },
    ],
    message: 'Hello Test Message',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    feedCommentsService = moduleRef.get<FeedCommentsService>(FeedCommentsService);
    feedLikesService = moduleRef.get<FeedLikesService>(FeedLikesService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    rssFeedProviderFollowsService = moduleRef.get<RssFeedProviderFollowsService>(RssFeedProviderFollowsService);

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

    activeUser = await usersService.create(userFactory.build({
      profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
    }));
    user0 = await usersService.create(userFactory.build({
      profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
    }));
    user1 = await usersService.create(userFactory.build({
      profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
    }));
    user2 = await usersService.create(userFactory.build({
      profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
    }));

    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
    feedPost = await feedPostsService.create(feedPostFactory.build({ userId: activeUser._id }));
    jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));

    feedPost = await feedPostsService.create(
      feedPostFactory.build({
        userId: activeUser._id,
      }),
    );

    feedComment = await feedCommentsService.createFeedComment(
      feedCommentsFactory.build({
        userId: activeUser._id,
        feedPostId: feedPost.id,
        message: feedCommentsAndReplyObject.message,
        images: feedCommentsAndReplyObject.images,
      }),
    );

    feedReply = await feedCommentsService.createFeedReply(
      feedRepliesFactory.build(
        {
          userId: activeUser._id,
          feedCommentId: feedComment.id,
          message: feedCommentsAndReplyObject.message,
          images: feedCommentsAndReplyObject.images,
        },
      ),
    );

    // make user0 friend
    await friendsService.createFriendRequest(activeUser._id.toString(), user0._id.toString());
    await friendsService.acceptFriendRequest(activeUser._id.toString(), user0._id.toString());
    // make user1 friend
    await friendsService.createFriendRequest(activeUser._id.toString(), user1._id.toString());
    await friendsService.acceptFriendRequest(activeUser._id.toString(), user1._id.toString());

    await rssFeedProviderFollowsService.create(
      {
        userId: activeUser._id,
        rssfeedProviderId: rssFeedProviderData._id,
      },
    );

    // Create 3 reply like by the user itself, user0, user1
    await feedLikesService.createFeedReplyLike(feedReply._id.toString(), activeUser._id.toString());
    await feedLikesService.createFeedReplyLike(feedReply._id.toString(), user0._id.toString());
    await feedLikesService.createFeedReplyLike(feedReply._id.toString(), user1._id.toString());
  });

  describe('GET /api/v1/feed-likes/reply/:feedReplyId/users', () => {
    it('requires authentication', async () => {
      const feedReplyId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).get(`/api/v1/feed-likes/reply/${feedReplyId}/users`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns the expected response upon successful request', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-likes/reply/${feedReply.id}/users?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();

      expect(response.body).toEqual([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          firstName: activeUser.firstName,
          friendship: null,
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          userName: activeUser.userName,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          firstName: user0.firstName,
          friendship: {
            reaction: 3,
            from: activeUser._id.toString(),
            to: user0._id.toString(),
          },
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          userName: user0.userName,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          firstName: user1.firstName,
          friendship: {
            reaction: 3,
            from: activeUser._id.toString(),
            to: user1._id.toString(),
          },
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          userName: user1.userName,
        },
      ]);
    });

    describe('when `offset` argument is supplied', () => {
      beforeEach(async () => {
        // Create 4th like by `user2`
        await feedLikesService.createFeedReplyLike(feedReply._id.toString(), user2._id.toString());
      });
      it('get expected first and second sets of paginated results', async () => {
        const limit = 2;
        const firstResponse = await request(app.getHttpServer())
          .get(`/api/v1/feed-likes/reply/${feedReply.id}/users?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.body).toHaveLength(2);
        expect(firstResponse.body).toEqual([
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            firstName: activeUser.firstName,
            friendship: null,
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            userName: activeUser.userName,
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            firstName: user0.firstName,
            friendship: {
              reaction: 3,
              from: activeUser._id.toString(),
              to: user0._id.toString(),
            },
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            userName: user0.userName,
          },
        ]);

        const secondResponse = await request(app.getHttpServer())
          .get(`/api/v1/feed-likes/reply/${feedReply.id}/users?limit=${limit}&offset=2`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.body).toHaveLength(2);
        expect(secondResponse.body).toEqual([
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            firstName: user1.firstName,
            friendship: {
              reaction: 3,
              from: activeUser._id.toString(),
              to: user1._id.toString(),
            },
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            userName: user1.userName,
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            firstName: user2.firstName,
            friendship: null,
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            userName: user2.userName,
          },
        ]);
      });
    });

    describe('should expect empty array response when no likes exists for the given comment', () => {
      let feedReplyNotLiked;
      beforeEach(async () => {
        feedReplyNotLiked = await feedCommentsService.createFeedReply(
          feedRepliesFactory.build(
            {
              userId: activeUser._id,
              feedCommentId: feedComment.id,
              message: feedCommentsAndReplyObject.message,
              images: feedCommentsAndReplyObject.images,
            },
          ),
        );
      });

      it('return empty array when no likes exists found for the given `feedpost`', async () => {
        const limit = 2;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-likes/reply/${feedReplyNotLiked.id}/users?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([]);
      });
    });

    it('when user is block than expected response.', async () => {
      const feedReplyNew = await feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: user1._id,
            feedCommentId: feedComment.id,
            message: feedCommentsAndReplyObject.message,
            images: feedCommentsAndReplyObject.images,
          },
        ),
      );
      await blocksModel.create({
        from: activeUser._id.toString(),
        to: user1._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-likes/reply/${feedReplyNew.id}/users?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Request failed due to user block (reply owner).',
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
      // create a comment by the feedpost owner itself i.e., `user`
      const feedCommentNew = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build({
          userId: user._id,
          feedPostId: post.id,
          message: feedCommentsAndReplyObject.message,
          images: feedCommentsAndReplyObject.images,
        }),
      );
      const feedReplyNew = await feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: user1._id,
            feedCommentId: feedCommentNew.id,
            message: feedCommentsAndReplyObject.message,
            images: feedCommentsAndReplyObject.images,
          },
        ),
      );
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-likes/reply/${feedReplyNew.id}/users?limit=${limit}`)
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

      const feedCommentNew = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build({
          userId: user0._id,
          feedPostId: post.id,
          message: feedCommentsAndReplyObject.message,
          images: feedCommentsAndReplyObject.images,
        }),
      );
      const feedReplyNew = await feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: user1._id,
            feedCommentId: feedCommentNew.id,
            message: feedCommentsAndReplyObject.message,
            images: feedCommentsAndReplyObject.images,
          },
        ),
      );
      // Create 3 reply like by the user itself, user0, user1
      await feedLikesService.createFeedReplyLike(feedReplyNew._id.toString(), activeUser._id.toString());
      await feedLikesService.createFeedReplyLike(feedReplyNew._id.toString(), user0._id.toString());
      await feedLikesService.createFeedReplyLike(feedReplyNew._id.toString(), user1._id.toString());

      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-likes/reply/${feedReplyNew.id}/users?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          firstName: activeUser.firstName,
          friendship: null,
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          userName: activeUser.userName,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          firstName: user0.firstName,
          friendship: {
            reaction: 3,
            from: activeUser._id.toString(),
            to: user0._id.toString(),
          },
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          userName: user0.userName,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          firstName: user1.firstName,
          friendship: {
            reaction: 3,
            from: activeUser._id.toString(),
            to: user1._id.toString(),
          },
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          userName: user1.userName,
        },
      ]);
    });

    describe('Validation', () => {
      it('return expected response when feed reply not found', async () => {
        const nonExistingFeedReplyId = new mongoose.Types.ObjectId().toString();
        const limit = 5;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-likes/reply/${nonExistingFeedReplyId}/users?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toBe('Reply not found');
      });

      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-likes/reply/${feedReply._id.toString()}/users`)
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
          .get(`/api/v1/feed-likes/reply/${feedReply.id}/users?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toEqual([
          'limit must not be greater than 30',
          'limit must be a number conforming to the specified constraints',
        ]);
      });

      it('limit should not be greter than 30', async () => {
        const limit = 31;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-likes/reply/${feedReply._id.toString()}/users?limit=${limit}`)
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
          .get(`/api/v1/feed-likes/reply/${feedReply._id.toString()}/users?limit=${limit}&offset=${offset}`)
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
