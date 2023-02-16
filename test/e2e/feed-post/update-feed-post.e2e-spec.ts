import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus, VersioningType } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { FeedPostDocument } from '../../../src/schemas/feedPost/feedPost.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';

describe('Update Feed Post (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let user1: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let feedPost: FeedPostDocument;

  const sampleFeedPostObject = {
    message: 'hello all test user upload your feed post',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
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
    activeUser = await usersService.create(userFactory.build());
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
  });

  describe('Update Feed Post Details', () => {
    it('successfully update feed post details, and updates the lastUpdateAt time', async () => {
      const postBeforeUpdate = await feedPostsService.findById(feedPost.id, true);
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(sampleFeedPostObject);
      const feedPostDetails = await feedPostsService.findById(response.body._id, true);
      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        message: 'hello all test user upload your feed post',
      });
      expect(feedPostDetails.lastUpdateAt > postBeforeUpdate.lastUpdateAt).toBe(true);
    });

    it('when userId is not match than expected feed post response', async () => {
      const feedPostDetails = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: user1._id,
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPostDetails._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body.message).toBe('You can only edit a post that you created.');
    });

    it('when feed post is not found, returns the expected feed post response', async () => {
      const feedPostDetails = '634fc8d86a5897b88a2d9753';
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPostDetails}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Post not found');
    });
  });

  describe('Validation', () => {
    it('check message length validation', async () => {
      sampleFeedPostObject.message = new Array(20_002).join('z');
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(sampleFeedPostObject);
      expect(response.body.message).toContain('message cannot be longer than 20,000 characters');
    });
  });
});
