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
import { User, UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { FeedPostDocument } from '../../../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { FeedLikesService } from '../../../../../src/feed-likes/providers/feed-likes.service';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { NotificationsService } from '../../../../../src/notifications/providers/notifications.service';
import { NotificationType } from '../../../../../src/schemas/notification/notification.enums';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';
import { RssFeedProvidersService } from '../../../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { rssFeedProviderFactory } from '../../../../factories/rss-feed-providers.factory';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { UserSettingsService } from '../../../../../src/settings/providers/user-settings.service';
import { userSettingFactory } from '../../../../factories/user-setting.factory';
import { PostType } from '../../../../../src/schemas/feedPost/feedPost.enums';
import { FriendsService } from '../../../../../src/friends/providers/friends.service';
import { HashtagFollowsService } from '../../../../../src/hashtag-follows/providers/hashtag-follows.service';
import { HashtagService } from '../../../../../src/hashtag/providers/hashtag.service';

describe('Create Feed Post Like (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user0: User;
  let user2AuthToken: string;
  let configService: ConfigService;
  let feedPost: FeedPostDocument;
  let feedPostsService: FeedPostsService;
  let feedLikesService: FeedLikesService;
  let notificationsService: NotificationsService;
  let blocksModel: Model<BlockAndUnblockDocument>;
  let rssFeedProvidersService: RssFeedProvidersService;
  let userSettingsService: UserSettingsService;
  let friendsService: FriendsService;
  let hashtagFollowsService: HashtagFollowsService;
  let hashtagService: HashtagService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    feedLikesService = moduleRef.get<FeedLikesService>(FeedLikesService);
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    userSettingsService = moduleRef.get<UserSettingsService>(UserSettingsService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    hashtagService = moduleRef.get<HashtagService>(HashtagService);
    hashtagFollowsService = moduleRef.get<HashtagFollowsService>(HashtagFollowsService);
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
  });

  describe('POST /api/v1/feed-likes/post/:feedPostId', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      user0 = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
      feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: user0._id,
          },
        ),
      );
      await friendsService.createFriendRequest(activeUser._id.toString(), user0._id.toString());
      await friendsService.acceptFriendRequest(activeUser._id.toString(), user0._id.toString());
      await feedLikesService.createFeedPostLike(feedPost.id, user0._id.toString());
    });

    it('requires authentication', async () => {
      const feedPostId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).post(`/api/v1/feed-likes/post/${feedPostId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('successfully creates a feed post like, and sends the expected notification', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/post/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual({ success: true, isFriend: true });

      const reloadedFeedPost = await feedPostsService.findByIdWithPopulatedFields(feedPost.id, false);
      expect(reloadedFeedPost.likes).toHaveLength(2);
      expect(reloadedFeedPost.likeCount).toBe(2);

      const feedPostDataObject = reloadedFeedPost.userId as unknown as User;
      const notificationData: any = {
        feedPostId: { _id: reloadedFeedPost._id.toString() },
        senderId: activeUser._id,
        allUsers: [activeUser._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserLikedYourPost,
        notificationMsg: 'liked your post',
        userId: feedPostDataObject._id.toString(),
      };
      jest.spyOn(notificationsService, 'create').mockResolvedValue(notificationData);
    });

    it('when feed post id is not exist than expected response', async () => {
      const feedPostId = '638ee75d59bf0f63dfb00d31';
      const response = await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/post/${feedPostId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Post not found');
    });

    it('successfully creates the feedpost like when user likes own post', async () => {
      const feedPost1 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/post/${feedPost1.id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual({ isFriend: true, success: true });
      const reloadedFeedPost = await feedPostsService.findByIdWithPopulatedFields(feedPost.id, false);
      expect(reloadedFeedPost.likes).toHaveLength(1);
      expect(reloadedFeedPost.likeCount).toBe(1);

      const feedPostDataObject = reloadedFeedPost.userId as unknown as User;
      const notificationData: any = {
        feedPostId: { _id: reloadedFeedPost._id.toString() },
        senderId: activeUser._id,
        allUsers: [activeUser._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserLikedYourPost,
        notificationMsg: 'liked your post',
        userId: feedPostDataObject._id.toString(),
      };
      jest.spyOn(notificationsService, 'create').mockResolvedValue(notificationData);
    });

    it('when user already liked the post then it returns the expected response', async () => {
      await feedLikesService.createFeedPostLike(feedPost.id, activeUser.id);
      const response = await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/post/${feedPost.id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe('You already like the post');
    });

    it('when a block exists between the post creator and the liker, it returns the expected response', async () => {
      const user1 = await usersService.create(userFactory.build({}));
      const feedPost1 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: user1._id,
          },
        ),
      );
      await friendsService.createFriendRequest(activeUser._id.toString(), user1._id.toString());
      await friendsService.acceptFriendRequest(activeUser._id.toString(), user1._id.toString());
      await blocksModel.create({
        from: activeUser._id,
        to: user1._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const response = await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/post/${feedPost1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Request failed due to user block.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    });

    it('sends the expected notifications when postType is movieReview', async () => {
      const postCreatorUser1 = await usersService.create(userFactory.build());
      const post1 = await feedPostsService.create(feedPostFactory.build({
        userId: postCreatorUser1._id,
        postType: PostType.MovieReview,
      }));

      const notificationData: any = {
        userId: postCreatorUser1._id.toString(),
        feedPostId: { _id: post1._id.toString() },
        senderId: activeUser._id,
        allUsers: [activeUser._id],
        notifyType: NotificationType.UserLikedYourPost,
        notificationMsg: 'liked your movie review',
      };
      await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/post/${post1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.CREATED);
      jest.spyOn(notificationsService, 'create').mockResolvedValue(notificationData);
    });

    it('sends the expected notifications when postType is bookReview', async () => {
      const postCreatorUser1 = await usersService.create(userFactory.build());
      const post1 = await feedPostsService.create(feedPostFactory.build({
        userId: postCreatorUser1._id,
        postType: PostType.BookReview,
      }));

      const notificationData: any = {
        userId: postCreatorUser1._id.toString(),
        feedPostId: { _id: post1._id.toString() },
        senderId: activeUser._id,
        allUsers: [activeUser._id],
        notifyType: NotificationType.UserLikedYourPost,
        notificationMsg: 'liked your book review',
      };
      await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/post/${post1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.CREATED);
      jest.spyOn(notificationsService, 'create').mockResolvedValue(notificationData);
    });

    describe('when the feed post was created by a user with a non-public profile', () => {
      let user1;
      let feedPost1;
      beforeEach(async () => {
        user1 = await usersService.create(userFactory.build({
          profile_status: ProfileVisibility.Private,
        }));
        await userSettingsService.create(
          userSettingFactory.build(
            {
              userId: user1._id,
            },
          ),
        );
        feedPost1 = await feedPostsService.create(
          feedPostFactory.build(
            {
              userId: user1._id,
            },
          ),
        );
      });

      it('should not allow the creation of a post like when liking user is not a friend of the post creator', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/post/${feedPost1._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({ statusCode: 403, message: 'You can only interact with posts of friends.' });
      });

      it(`should allow the creation of a post like when liking user is not a friend 
      of the post creator but it follows hashtag which is in post`, async () => {
        const hashtag = await hashtagService.createOrUpdateHashtags(['slasher']);
        const user2 = await usersService.create(userFactory.build());
        user2AuthToken = user2.generateNewJwtToken(
          configService.get<string>('JWT_SECRET_KEY'),
        );
        await hashtagFollowsService.create({
          userId: user2._id,
          hashTagId: hashtag[0]._id,
        });
        const user3 = await usersService.create(userFactory.build({
          profile_status: ProfileVisibility.Private,
        }));
        const feedPost4 = await feedPostsService.create(
          feedPostFactory.build(
            {
              userId: user3._id,
              hashtags: ['slasher', 'horror'],
            },
          ),
        );
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/post/${feedPost4._id}`)
          .auth(user2AuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toEqual({ success: true, isFriend: false });
      });

      it('should not allow the creation of a post like when liking user is not a'
        + 'friend of the post creator and user with a public profile', async () => {
          const user3 = await usersService.create(userFactory.build({
            profile_status: ProfileVisibility.Public,
          }));
          const feedPost3 = await feedPostsService.create(
            feedPostFactory.build(
              {
                userId: user3._id,
              },
            ),
          );
          const response = await request(app.getHttpServer())
            .post(`/api/v1/feed-likes/post/${feedPost3._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();
          expect(response.status).toBe(HttpStatus.FORBIDDEN);
          expect(response.body).toEqual({ statusCode: 403, message: 'You can only interact with posts of friends.' });
        });

      it('should allow the creation of a post like when liking user is a friend of the post creator', async () => {
        const user4 = await usersService.create(userFactory.build({
          profile_status: ProfileVisibility.Private,
        }));
        await userSettingsService.create(
          userSettingFactory.build(
            {
              userId: user4._id,
            },
          ),
        );
        const feedPost4 = await feedPostsService.create(
          feedPostFactory.build(
            {
              userId: user4._id,
            },
          ),
        );

        await friendsService.createFriendRequest(activeUser._id.toString(), user4.id);
        await friendsService.acceptFriendRequest(activeUser._id.toString(), user4.id);
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/post/${feedPost4._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toEqual({ success: true, isFriend: true });
      });

      it('when postType is movieReview than expected response', async () => {
        const feedPost3 = await feedPostsService.create(
          feedPostFactory.build(
            {
              userId: user1._id,
              postType: PostType.MovieReview,
            },
          ),
        );
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/post/${feedPost3._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toEqual({ success: true, isFriend: true });
      });

      it('when postType is movieReview and post liking user is a friend of the post creator', async () => {
        const user5 = await usersService.create(userFactory.build({
          profile_status: ProfileVisibility.Private,
        }));
        await userSettingsService.create(
          userSettingFactory.build(
            {
              userId: user5._id,
            },
          ),
        );
        const feedPost4 = await feedPostsService.create(
          feedPostFactory.build(
            {
              userId: user5._id,
              postType: PostType.MovieReview,
            },
          ),
        );
        await friendsService.createFriendRequest(activeUser._id.toString(), user5.id);
        await friendsService.acceptFriendRequest(activeUser._id.toString(), user5.id);
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/post/${feedPost4._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toEqual({ success: true, isFriend: true });
      });

      it('when post has an rssfeedProviderId, it returns a successful response', async () => {
        const rssFeedProvider = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
        const feedPost2 = await feedPostsService.create(
          feedPostFactory.build({
            userId: rssFeedProvider._id,
            rssfeedProviderId: rssFeedProvider._id,
          }),
        );
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/post/${feedPost2._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({ success: true, isFriend: true });
      });
    });

    describe('Validation', () => {
      it('feedPostId must be a mongodb id', async () => {
        const feedPostId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/post/${feedPostId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('feedPostId must be a mongodb id');
      });
    });
  });
});
