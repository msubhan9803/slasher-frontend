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
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { rssFeedProviderFactory } from '../../../../factories/rss-feed-providers.factory';
import { Friend, FriendDocument } from '../../../../../src/schemas/friend/friend.schema';
import { FriendRequestReaction } from '../../../../../src/schemas/friend/friend.enums';
import { RssFeedProvider } from '../../../../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { RssFeedProvidersService } from '../../../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Feed-Post / Main Feed Posts (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let user1AuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let user1: User;
  let rssFeedProviderData: RssFeedProvider;
  let friendsModel: Model<FriendDocument>;
  let rssFeedProvidersService: RssFeedProvidersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    friendsModel = moduleRef.get<Model<FriendDocument>>(getModelToken(Friend.name));

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
    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    user1 = await usersService.create(userFactory.build());
    user1AuthToken = user1.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
    await friendsModel.create({
      from: activeUser._id.toString(),
      to: user1._id.toString(),
      reaction: FriendRequestReaction.Accepted,
    });
  });

  describe('POST /api/v1/feed-posts/:id/hide', () => {
    let feedPost;
    let rssFeedPost;
    beforeEach(async () => {
      // Create post by `user1`
      feedPost = await feedPostsService.create(feedPostFactory.build({ userId: user1._id }));
      rssFeedPost = await feedPostsService.create(feedPostFactory.build({
        userId: rssFeedProviderData._id,
        rssfeedProviderId: rssFeedProviderData._id,
      }));
    });

    it('requires authentication', async () => {
      const feedPostId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).post(`/api/v1/feed-posts/${feedPostId}/hide`).expect(HttpStatus.UNAUTHORIZED);
    });

    it("should successfully mark a different user's post as hidden", async () => {
      // Hide post for activeUser
      const response = await request(app.getHttpServer())
        .post(`/api/v1/feed-posts/${feedPost._id.toString()}/hide`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ success: true });
    });

    it('should successfully mark an rss feed post as hidden', async () => {
      // Hide post for activeUser
      const response = await request(app.getHttpServer())
        .post(`/api/v1/feed-posts/${rssFeedPost._id.toString()}/hide`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ success: true });
    });

    describe('validations', () => {
      it('id must be a mongodb id', async () => {
        const feedPostId = 'not-a-mongo-id';
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-posts/${feedPostId}/hide`)
          .auth(user1AuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'id must be a mongodb id',
        );
      });

      it('should *not* be able to mark post hidden which is created by user', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-posts/${feedPost._id.toString()}/hide`)
          .auth(user1AuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toBe(403);
        expect(response.body).toEqual({
          message: 'You cannot hide your own post.',
          statusCode: 403,
        });
      });

      it('should return appropriate error when post is not found', async () => {
        const unknownFeedPost = new mongoose.Types.ObjectId();
        const response = await request(app.getHttpServer())
          .post(`/api/v1/feed-posts/${unknownFeedPost._id.toString()}/hide`)
          .auth(user1AuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
          message: 'Post not found.',
          statusCode: 404,
        });
      });
    });
  });
});
