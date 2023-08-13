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
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Feed-Post / Delete Feed Post (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let user1: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
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

  describe('DELETE /api/v1/feed-posts/:id', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      user1 = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
    });

    it('requires authentication', async () => {
      const feedPostId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).delete(`/api/v1/feed-posts/${feedPostId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns the expected feed post response if feed post is deleted', async () => {
      const feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual({ success: true });
      expect(activeUser._id.toString()).toEqual((feedPost.userId as any)._id.toString());
    });

    it('when userId is not match than expected feed post response', async () => {
      const feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: user1._id,
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body.message).toBe('You can only delete a post that you created.');
    });

    it('when feed post is not found than expected feed post response', async () => {
      const feedPost = '634fc8d86a5897b88a2d9753';
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/feed-posts/${feedPost}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Post not found');
    });

    describe('Validation', () => {
      it('id must be a mongodb id', async () => {
        const feedPostId = 'not-a-mongo-id';
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/feed-posts/${feedPostId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain(
          'id must be a mongodb id',
        );
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });
  });
});
