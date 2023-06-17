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
import { NotificationsService } from '../../../../../src/notifications/providers/notifications.service';
import { NotificationType } from '../../../../../src/schemas/notification/notification.enums';
import { FeedComment } from '../../../../../src/schemas/feedComment/feedComment.schema';
import { feedCommentsFactory } from '../../../../factories/feed-comments.factory';
import { feedRepliesFactory } from '../../../../factories/feed-reply.factory';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { UserSettingsService } from '../../../../../src/settings/providers/user-settings.service';
import { userSettingFactory } from '../../../../factories/user-setting.factory';

describe('Create Feed Reply Like (e2e)', () => {
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
        description: 'this create feed reply like description 1',
      },
      {
        image_path: 'https://picsum.photos/seed/picsum/200/300',
        description: 'this create feed reply like description 2',
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
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
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

  describe('POST /api/v1/feed-likes/reply/:feedReplyId', () => {
    let feedComments;
    let feedReply;
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
      feedComments = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: activeUser._id,
            feedPostId: feedPost.id,
            message: feedCommentsAndReplyObject.message,
            images: feedCommentsAndReplyObject.images,
          },
        ),
      );
      feedReply = await feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: user0._id,
            feedCommentId: feedComments.id,
            message: feedCommentsAndReplyObject.message,
            images: feedCommentsAndReplyObject.images,
          },
        ),
      );
    });

    it('requires authentication', async () => {
      const feedReplyId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).post(`/api/v1/feed-likes/reply/${feedReplyId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('successfully creates a feed reply like, and sends the expected notification', async () => {
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));
      const response = await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/reply/${feedReply._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual({ success: true });
      const reloadedFeedReply = await feedCommentsService.findFeedReply(feedReply.id);
      expect(reloadedFeedReply.likes).toContainEqual(activeUser._id);

      expect(notificationsService.create).toHaveBeenCalledWith({
        userId: reloadedFeedReply.userId as any,
        feedPostId: { _id: reloadedFeedReply.feedPostId } as unknown as FeedPost,
        feedCommentId: { _id: reloadedFeedReply.feedCommentId } as unknown as FeedComment,
        feedReplyId: reloadedFeedReply._id,
        senderId: activeUser._id,
        allUsers: [activeUser._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserMentionedYouInAComment_MentionedYouInACommentReply_LikedYourReply_RepliedOnYourPost,
        notificationMsg: 'liked your reply',
      });
    });

    it('when feed reply id is not exist than expected response', async () => {
      const feedReplyId = '638ee75d59bf0f63dfb00d31';
      const response = await request(app.getHttpServer())
        .post(`/api/v1/feed-likes/reply/${feedReplyId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Reply not found');
    });

    describe('notifications', () => {
      it('when notification is create for createFeedReplyLike than check newNotificationCount is increment in user', async () => {
        const postCreatorUser = await usersService.create(userFactory.build({ userName: 'Divine' }));
        const otherUser1 = await usersService.create(userFactory.build({ userName: 'Denial' }));
        await userSettingsService.create(
          userSettingFactory.build(
            {
              userId: otherUser1._id,
            },
          ),
        );
        const post = await feedPostsService.create(feedPostFactory.build({ userId: postCreatorUser._id }));
        const comment = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: activeUser._id,
              feedPostId: post.id,
              message: 'This is a comment',
              images: [],
            },
          ),
        );
        const reply = await feedCommentsService.createFeedReply(
          feedRepliesFactory.build(
            {
              userId: otherUser1._id,
              feedCommentId: comment.id,
              message: 'This is reply lie ',
              images: [],
            },
          ),
        );
        await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/reply/${reply._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.CREATED);
        const otherUser1NewNotificationCount = await usersService.findById(otherUser1.id, true);
        expect(otherUser1NewNotificationCount.newNotificationCount).toBe(1);
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
        const feedReply1 = await feedCommentsService.createFeedReply(
          feedRepliesFactory.build(
            {
              userId: user0._id,
              feedCommentId: feedComments1.id,
              message: feedCommentsAndReplyObject.message,
              images: feedCommentsAndReplyObject.images,
            },
          ),
        );
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/reply/${feedReply1._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'Request failed due to user block (post owner).',
          statusCode: HttpStatus.FORBIDDEN,
        });
      });

      it('when a block exists between the reply creator and the liker, it returns the expected response', async () => {
        const user3 = await usersService.create(userFactory.build({}));
        await blocksModel.create({
          from: activeUser._id.toString(),
          to: user3._id,
          reaction: BlockAndUnblockReaction.Block,
        });
        const feedReply2 = await feedCommentsService.createFeedReply(
          feedRepliesFactory.build(
            {
              userId: user3._id,
              feedCommentId: feedComments.id,
              message: feedCommentsAndReplyObject.message,
              images: feedCommentsAndReplyObject.images,
            },
          ),
        );
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/reply/${feedReply2._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({
          message: 'Request failed due to user block (reply owner).',
          statusCode: HttpStatus.FORBIDDEN,
        });
      });

      it('when post not exists, it returns the expected response', async () => {
        const feedComments3 = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: activeUser._id,
              feedPostId: user0._id,
              message: feedCommentsAndReplyObject.message,
              images: feedCommentsAndReplyObject.images,
            },
          ),
        );
        const feedReply3 = await feedCommentsService.createFeedReply(
          feedRepliesFactory.build(
            {
              userId: activeUser._id,
              feedCommentId: feedComments3.id,
              message: feedCommentsAndReplyObject.message,
              images: feedCommentsAndReplyObject.images,
            },
          ),
        );
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/reply/${feedReply3._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'Post not found',
          statusCode: HttpStatus.NOT_FOUND,
        });
      });
    });

    describe('Validation', () => {
      it('feedReplyId must be a mongodb id', async () => {
        const feedReplyId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-likes/reply/${feedReplyId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('feedReplyId must be a mongodb id');
      });
    });
  });
});
