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
import { FeedLikesService } from '../../../src/feed-likes/providers/feed-likes.service';
import { NotificationsService } from '../../../src/notifications/providers/notifications.service';
import { NotificationType } from '../../../src/schemas/notification/notification.enums';

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

  describe('POST /feed-Likes', () => {
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

    it.only('successfully creates feed post likes.', async () => {
      jest.spyOn(notificationsService, 'create').mockImplementation(() => Promise.resolve(undefined));
      const response = await request(app.getHttpServer())
        .post(`/feed-likes/post/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.CREATED);

      const feedPostData = await feedPostsService.findById(feedPost.id, false);
      // console.log('e2eTestLog', {
      //   userId: feedPostData.userId as any,
      //   feedPostId: { _id: feedPostData._id } as unknown as FeedPost,
      //   senderId: activeUser._id,
      //   notifyType: NotificationType.UserLikedYourPost,
      //   notificationMsg: 'liked your post',
      // });

      // ******* Desired Output
      // expect(notificationsService.create).toHaveBeenCalledWith('ok?');
      // {
      // "feedPostId": {"_id": "63da2fe64baf57edb6b2b60e"},
      // "notificationMsg": "liked your post",
      // "notifyType": 13,
      // "senderId": "63da2fe64baf57edb6b2b60a",
      // "userId": {
      //    "_id": "63da2fe64baf57edb6b2b60c",
      //    "profilePic": "noUser.jpg",
      //    "userName": "Username2"
      //    }
      // }
      // *******

      const feedPostDataObject = (feedPostData as any).toObject();
      expect(notificationsService.create).toHaveBeenCalledWith({
        feedPostId: { _id: feedPostData._id.toString() },
        senderId: activeUser._id.toString(),
        notifyType: NotificationType.UserLikedYourPost,
        notificationMsg: 'liked your post',
        userId: {
          _id: feedPostDataObject.userId._id.toString(),
          profilePic: feedPostDataObject.userId.profilePic,
          userName: feedPostDataObject.userId.userName,
        },
      });
      expect(response.body).toEqual({ success: true });
    });

    it('when feed post id is not exist than expected response', async () => {
      const feedPostId = '638ee75d59bf0f63dfb00d31';
      const response = await request(app.getHttpServer())
        .post(`/feed-likes/post/${feedPostId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Post not found');
    });

    describe('Validation', () => {
      it('feedPostId must be a mongodb id', async () => {
        const feedPostId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .post(`/feed-likes/post/${feedPostId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('feedPostId must be a mongodb id');
      });
    });
  });
});
