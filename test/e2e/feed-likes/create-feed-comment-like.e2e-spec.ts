import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { FeedPost, FeedPostDocument } from '../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { FeedCommentsService } from '../../../src/feed-comments/providers/feed-comments.service';
import { NotificationsService } from '../../../src/notifications/providers/notifications.service';
import { NotificationType } from '../../../src/schemas/notification/notification.enums';
import { FeedComment } from '../../../src/schemas/feedComment/feedComment.schema';

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

  const feedCommentsAndReplyObject = {
    images: [
      {
        image_path: 'https://picsum.photos/id/237/200/300',
      },
      {
        image_path: 'https://picsum.photos/seed/picsum/200/300',
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

  describe('POST /feed-likes/comment/:feedCommentId', () => {
    let feedComments;
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
      feedComments = await feedCommentsService
        .createFeedComment(
          feedPost.id,
          user0._id.toString(),
          feedCommentsAndReplyObject.message,
          feedCommentsAndReplyObject.images,
        );
    });

    it('successfully creates feed comment likes.', async () => {
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));

      const response = await request(app.getHttpServer())
        .post(`/feed-likes/comment/${feedComments._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual({ success: true });

      const feedCommentsData = await feedCommentsService.findFeedComment(feedComments.id);

      expect(notificationsService.create).toHaveBeenCalledWith({
        userId: feedCommentsData.userId as any,
        feedPostId: { _id: feedCommentsData.feedPostId } as unknown as FeedPost,
        feedCommentId: { _id: feedCommentsData._id } as unknown as FeedComment,
        senderId: activeUser._id,
        notifyType: NotificationType.UserLikedYourComment,
        notificationMsg: 'liked your comment',
      });
    });

    it('when feed comment id is not exist than expected response', async () => {
      const feedCommentId = '638ee75d59bf0f63dfb00d31';
      const response = await request(app.getHttpServer())
        .post(`/feed-likes/comment/${feedCommentId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Comment not found');
    });

    describe('Validation', () => {
      it('feedCommentId must be a mongodb id', async () => {
        const feedCommentId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .post(`/feed-likes/comment/${feedCommentId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('feedCommentId must be a mongodb id');
      });
    });
  });
});
