import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { FeedPostDocument } from '../../../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { FeedCommentsService } from '../../../../../src/feed-comments/providers/feed-comments.service';
import { feedCommentsFactory } from '../../../../factories/feed-comments.factory';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';

describe('Feed-Comments / Comments Delete (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let user0: User;
  let user1: User;
  let configService: ConfigService;
  let feedPost: FeedPostDocument;
  let feedPostsService: FeedPostsService;
  let feedCommentsService: FeedCommentsService;

  const sampleFeedCommentsDeleteObject = {
    message: 'hello all test user upload your feed comments',
    images: [
      {
        image_path: 'https://picsum.photos/id/237/200/300',
      },
      {
        image_path: 'https://picsum.photos/seed/picsum/200/300',
      },
    ],
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
  });

  describe('DELETE /api/v1/feed-comments/:feedCommentId', () => {
    let feedComments;
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      user0 = await usersService.create(userFactory.build());
      user1 = await usersService.create(userFactory.build());
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
            message: sampleFeedCommentsDeleteObject.message,
            images: sampleFeedCommentsDeleteObject.images,
          },
        ),
      );
    });

    it('successfully delete feed comments', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/feed-comments/${feedComments._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({ success: true });
    });

    it('when feed comment id is not exists than expected response', async () => {
      const feedComments1 = '6386f95401218469e30dbd25';
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/feed-comments/${feedComments1}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body.message).toContain('Not found.');
    });

    it('succeeds when post creator attempts to delete a comment on the post', async () => {
      const feedComments1 = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: user0._id,
            feedPostId: feedPost.id,
            message: sampleFeedCommentsDeleteObject.message,
            images: sampleFeedCommentsDeleteObject.images,
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/feed-comments/${feedComments1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({ success: true });
    });

    it('succeeds when a comment creator (who is not the post creator) attempts to delete their own comment', async () => {
      const feedPost1 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: user0._id,
          },
        ),
      );
      const feedComments1 = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: activeUser._id,
            feedPostId: feedPost1.id,
            message: sampleFeedCommentsDeleteObject.message,
            images: sampleFeedCommentsDeleteObject.images,
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/feed-comments/${feedComments1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({ success: true });
    });

    it('fails when a user who is not the post creator tries to delete a comment created by a different user', async () => {
      const feedPost1 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: user0._id,
          },
        ),
      );
      const feedComments1 = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: user1._id,
            feedPostId: feedPost1.id,
            message: sampleFeedCommentsDeleteObject.message,
            images: sampleFeedCommentsDeleteObject.images,
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/feed-comments/${feedComments1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.FORBIDDEN);
      expect(response.body.message).toContain('Permission denied.');
    });
  });
});
