import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
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
import { feedCommentsFactory } from '../../factories/feed-comments.factory';

describe('Delete Feed Comment Like (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let user0: User;
  let configService: ConfigService;
  let feedPost: FeedPostDocument;
  let feedPostsService: FeedPostsService;
  let feedCommentsService: FeedCommentsService;
  let feedLikesService: FeedLikesService;

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
    feedLikesService = moduleRef.get<FeedLikesService>(FeedLikesService);
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  describe('Delete /feed-likes/comment/:feedCommentId', () => {
    let feedComments;
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

      await feedLikesService.createFeedCommentLike(feedComments.id, activeUser._id.toString());
      await feedLikesService.createFeedCommentLike(feedComments.id, user0._id.toString());
    });

    it('delete feed comment likes.', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/feed-likes/comment/${feedComments._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({ success: true });
      const feedCommentsData = await feedCommentsService.findFeedComment(feedComments.id);
      expect(feedCommentsData.likes).toHaveLength(1);
    });

    it('when feed comment id is not exist than expected response', async () => {
      const feedCommentId = '638ee75d59bf0f63dfb00d31';
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/feed-likes/comment/${feedCommentId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Comment not found');
    });

    describe('Validation', () => {
      it('feedCommentId must be a mongodb id', async () => {
        const feedCommentId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/feed-likes/comment/${feedCommentId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('feedCommentId must be a mongodb id');
      });
    });
  });
});
