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
import { PostType } from '../../../../../src/schemas/feedPost/feedPost.enums';

describe('Create Feed Post Like (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let user0: User;
  let configService: ConfigService;
  let feedPost: FeedPostDocument;
  let feedPostsService: FeedPostsService;
  let feedLikesService: FeedLikesService;
  let notificationsService: NotificationsService;
  let blocksModel: Model<BlockAndUnblockDocument>;
  let rssFeedProvidersService: RssFeedProvidersService;

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
      await feedLikesService.createFeedPostLike(feedPost.id, user0._id.toString());
    });

    it('requires authentication', async () => {
      const feedPostId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).post(`/api/v1/feed-likes/post/${feedPostId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('successfully creates a feed post like, and sends the expected notification', async () => {
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));
      const response = await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/post/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual({ success: true });

      const reloadedFeedPost = await feedPostsService.findById(feedPost.id, false);
      expect(reloadedFeedPost.likes).toHaveLength(2);
      expect(reloadedFeedPost.likeCount).toBe(2);

      const feedPostDataObject = reloadedFeedPost.userId as unknown as User;
      expect(notificationsService.create).toHaveBeenCalledWith({
        feedPostId: { _id: reloadedFeedPost._id.toString() },
        senderId: activeUser._id,
        allUsers: [activeUser._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserLikedYourPost,
        notificationMsg: 'liked your post',
        userId: feedPostDataObject._id.toString(),
      });
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

    it('when a block exists between the post creator and the liker, it returns the expected response', async () => {
      const user1 = await usersService.create(userFactory.build({}));
      const feedPost1 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: user1._id,
          },
        ),
      );
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
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));
      const postCreatorUser1 = await usersService.create(userFactory.build());
      const post1 = await feedPostsService.create(feedPostFactory.build({
        userId: postCreatorUser1._id,
        postType: PostType.MovieReview,
      }));
      await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/post/${post1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.CREATED);

      expect(notificationsService.create).toHaveBeenCalledTimes(1);
      expect(notificationsService.create).toHaveBeenCalledWith({
        userId: postCreatorUser1._id.toString(),
        feedPostId: { _id: post1._id.toString() },
        senderId: activeUser._id,
        allUsers: [activeUser._id],
        notifyType: NotificationType.UserLikedYourPost,
        notificationMsg: 'liked your movie review',
      });
    });

    describe('when the feed post was created by a user with a non-public profile', () => {
      let user1;
      let feedPost1;
      beforeEach(async () => {
        user1 = await usersService.create(userFactory.build({
          profile_status: ProfileVisibility.Private,
        }));
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
        expect(response.body).toEqual({ statusCode: 403, message: 'You must be friends with this user to perform this action.' });
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
        expect(response.body).toEqual({ success: true });
      });
    });

    describe('notifications', () => {
      it('when notification is create for createFeedPostLike than check newNotificationCount is increment in user', async () => {
        const postCreatorUser = await usersService.create(userFactory.build({ userName: 'Divine' }));
        const post = await feedPostsService.create(feedPostFactory.build({ userId: postCreatorUser._id }));

        await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/post/${post._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.CREATED);

        const postCreatorUserNewNotificationCount = await usersService.findById(postCreatorUser.id, true);
        expect(postCreatorUserNewNotificationCount.newNotificationCount).toBe(1);
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
