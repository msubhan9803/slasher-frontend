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
import { FeedPostDocument } from '../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { FeedCommentsService } from '../../../src/feed-comments/providers/feed-comments.service';
import { FeedLikesService } from '../../../src/feed-likes/providers/feed-likes.service';
import findOneFeedCommentsResponse from '../../fixtures/comments/find-one-feed-comments-response';

describe('Find Single Feed Comments With Replies (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let user0: User;
  let user1: User;
  let user3: User;
  let user2: User;
  let configService: ConfigService;
  let feedPost: FeedPostDocument;
  let feedPostsService: FeedPostsService;
  let feedCommentsService: FeedCommentsService;
  let feedLikesService: FeedLikesService;

  const commentImages = [
    {
      image_path: 'https://picsum.photos/id/237/200/300',
    },
    {
      image_path: 'https://picsum.photos/seed/picsum/200/300',
    },
  ];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    feedCommentsService = moduleRef.get<FeedCommentsService>(FeedCommentsService);
    feedLikesService = moduleRef.get<FeedLikesService>(FeedLikesService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
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
    user3 = await usersService.create(userFactory.build({
      profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
    }));
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
  });

  describe('GET /feed-comments/:feedCommentId', () => {
    it('get single feed comments with reply', async () => {
      const feedComments1 = await feedCommentsService
        .createFeedComment(
          feedPost.id,
          activeUser._id.toString(),
          'Comment 1',
          commentImages,
        );
      await feedLikesService.createFeedCommentLike(feedComments1._id.toString(), activeUser._id.toString());
      await feedLikesService.createFeedCommentLike(feedComments1._id.toString(), user0._id.toString());
      await feedLikesService.createFeedCommentLike(feedComments1._id.toString(), user1._id.toString());
      await feedLikesService.createFeedCommentLike(feedComments1._id.toString(), user2._id.toString());
      await feedLikesService.createFeedCommentLike(feedComments1._id.toString(), user3._id.toString());

      const feedReply1 = await feedCommentsService
        .createFeedReply(
          feedComments1._id.toString(),
          activeUser._id.toString(),
          'Hello Comment 1 Test Reply Message 1',
          commentImages,
        );
      await feedLikesService.createFeedReplyLike(feedReply1._id.toString(), activeUser._id.toString());
      await feedLikesService.createFeedReplyLike(feedReply1._id.toString(), user0._id.toString());

      const feedReply2 = await feedCommentsService
        .createFeedReply(
          feedComments1._id.toString(),
          activeUser._id.toString(),
          'Hello Comment 1 Test Reply Message 2',
          commentImages,
        );
      await feedLikesService.createFeedReplyLike(feedReply2._id.toString(), user1._id.toString());
      await feedLikesService.createFeedReplyLike(feedReply2._id.toString(), user0._id.toString());

      const response = await request(app.getHttpServer())
        .get(`/feed-comments/${feedComments1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual(findOneFeedCommentsResponse);
    });

    it('when feed comment id is not exists than expected response.', async () => {
      const feedCommentsId = '63940f0016e1db19bf32e72a';
      const response = await request(app.getHttpServer())
        .get(`/feed-comments/${feedCommentsId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body.message).toBe('Comment not found');
    });

    describe('Validation', () => {
      it('feedCommentId must be a mongodb id', async () => {
        const feedCommentId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .get(`/feed-comments/${feedCommentId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'feedCommentId must be a mongodb id',
        );
      });
    });
  });
});
