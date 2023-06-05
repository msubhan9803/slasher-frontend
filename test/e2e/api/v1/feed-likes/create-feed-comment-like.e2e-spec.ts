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
import { FeedPost, FeedPostDocument } from '../../../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { FeedCommentsService } from '../../../../../src/feed-comments/providers/feed-comments.service';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { NotificationsService } from '../../../../../src/notifications/providers/notifications.service';
import { NotificationType } from '../../../../../src/schemas/notification/notification.enums';
import { FeedComment } from '../../../../../src/schemas/feedComment/feedComment.schema';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';
import { feedCommentsFactory } from '../../../../factories/feed-comments.factory';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { UserSettingsService } from '../../../../../src/settings/providers/user-settings.service';
import { userSettingFactory } from '../../../../factories/user-setting.factory';

describe('Create Feed Comment Like (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPost: FeedPostDocument;
  let feedPostsService: FeedPostsService;
  let feedCommentsService: FeedCommentsService;
  let notificationsService: NotificationsService;
  let blocksModel: Model<BlockAndUnblockDocument>;
  let userSettingsService: UserSettingsService;

  const feedCommentsAndReplyObject = {
    images: [
      {
        image_path: 'https://picsum.photos/id/237/200/300',
        description: 'this create feed comment like description 1',

      },
      {
        image_path: 'https://picsum.photos/seed/picsum/200/300',
        description: 'this create feed comment like description 2',
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
    feedCommentsService = moduleRef.get<FeedCommentsService>(FeedCommentsService);
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    userSettingsService = moduleRef.get<UserSettingsService>(UserSettingsService);

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

  describe('POST /api/v1/feed-likes/comment/:feedCommentId', () => {
    let feedComment;
    let user0;
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      user0 = await usersService.create(userFactory.build());
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
      feedComment = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: user0._id,
            feedPostId: feedPost.id,
            message: feedCommentsAndReplyObject.message,
            images: feedCommentsAndReplyObject.images,
          },
        ),
      );
    });

    it('requires authentication', async () => {
      const feedCommentId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).post(`/api/v1/feed-likes/comment/${feedCommentId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('successfully creates a feed comment like, and sends the expected notification', async () => {
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));

      const response = await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/comment/${feedComment._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual({ success: true });

      const reloadedFeedComment = await feedCommentsService.findFeedComment(feedComment.id);
      expect(reloadedFeedComment.likes).toContainEqual(activeUser._id);

      expect(notificationsService.create).toHaveBeenCalledWith({
        userId: reloadedFeedComment.userId as any,
        feedPostId: { _id: reloadedFeedComment.feedPostId } as unknown as FeedPost,
        feedCommentId: { _id: reloadedFeedComment._id } as unknown as FeedComment,
        senderId: activeUser._id,
        allUsers: [activeUser._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserLikedYourComment,
        notificationMsg: 'liked your comment',
      });
    });

    it('when feed comment id is not exist than expected response', async () => {
      const feedCommentId = '638ee75d59bf0f63dfb00d31';
      const response = await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/comment/${feedCommentId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Comment not found');
    });

    it('when a block exists between the post creator and the liker, it returns the expected response', async () => {
      const user1 = await usersService.create(userFactory.build({}));
      const user2 = await usersService.create(userFactory.build({}));
      const feedPost1 = await feedPostsService.create(
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
      const feedComments1 = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: user2._id,
            feedPostId: feedPost1.id,
            message: feedCommentsAndReplyObject.message,
            images: feedCommentsAndReplyObject.images,
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/comment/${feedComments1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();

      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Request failed due to user block (post owner).',
        statusCode: HttpStatus.FORBIDDEN,
      });
    });

    it('when a block exists between the comment creator and the liker, it returns the expected response', async () => {
      const user1 = await usersService.create(userFactory.build({}));
      const feedPost1 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
          },
        ),
      );
      const feedComments1 = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: user1._id,
            feedPostId: feedPost1.id,
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
      const response = await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/comment/${feedComments1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Request failed due to user block (comment owner).',
        statusCode: HttpStatus.FORBIDDEN,
      });
    });

    describe('when the feed post was created by a user with a non-public profile', () => {
      let user1;
      let feedPost1;
      let feedComments1;
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
        feedComments1 = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: user1._id,
              feedPostId: feedPost1.id,
              message: feedCommentsAndReplyObject.message,
              images: feedCommentsAndReplyObject.images,
            },
          ),
        );
      });

      it('should not allow the creation of a comment like when liking user is not a friend of the post creator', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/comment/${feedComments1._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({ statusCode: 403, message: 'You must be friends with this user to perform this action.' });
      });
    });

    describe('notifications', () => {
      it('when notification is create for createFeedCommentLike than check newNotificationCount is increment in user', async () => {
        const user3 = await usersService.create(userFactory.build({ userName: 'Divine' }));
        const commentCreatorUser = await usersService.create(userFactory.build({ userName: 'Divine' }));
        await userSettingsService.create(
          userSettingFactory.build(
            {
              userId: commentCreatorUser._id,
            },
          ),
        );
        const post = await feedPostsService.create(feedPostFactory.build({ userId: user3._id }));
        const comment = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: commentCreatorUser.id,
              feedPostId: post.id,
              message: 'this is comment for the like',
              images: [],
            },
          ),
        );
        await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/comment/${comment._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.CREATED);

        const commentCreatorUserNewNotificationCount = await usersService.findById(commentCreatorUser.id, true);
        expect(commentCreatorUserNewNotificationCount.newNotificationCount).toBe(1);
      });
    });

    describe('Validation', () => {
      it('feedCommentId must be a mongodb id', async () => {
        const feedCommentId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/comment/${feedCommentId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('feedCommentId must be a mongodb id');
      });
    });
  });
});
