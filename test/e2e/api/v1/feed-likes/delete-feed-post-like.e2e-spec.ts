import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection } from 'mongoose';
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
import { FeedLikesService } from '../../../../../src/feed-likes/providers/feed-likes.service';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Delete Feed Post Likes (e2e)', () => {
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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    feedLikesService = moduleRef.get<FeedLikesService>(FeedLikesService);
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

  describe('DELETE /api/v1/feed-likes/post/:feedPostId', () => {
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
      await feedLikesService.createFeedPostLike(feedPost.id, activeUser._id.toString());
      await feedLikesService.createFeedPostLike(feedPost.id, user0._id.toString());
    });
    it('requires authentication', async () => {
      const feedPostId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).delete(`/api/v1/feed-Likes/post/${feedPostId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('delete feed post likes.', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/feed-likes/post/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.OK);
      expect(response.body).toEqual({ success: true });
      const feedPostData = await feedPostsService.findByIdWithPopulatedFields(feedPost.id, false);
      expect(feedPostData.likes).toHaveLength(1);
      expect(feedPostData.likeCount).toBe(1);
    });

    it('when feed post id is not exist than expected response', async () => {
      const feedPostId = '638ee75d59bf0f63dfb00d31';
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/feed-likes/post/${feedPostId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Post not found');
    });

    describe('Validation', () => {
      it('feedPostId must be a mongodb id', async () => {
        const feedPostId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/feed-likes/post/${feedPostId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('feedPostId must be a mongodb id');
      });
    });
  });
});
