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
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';

describe('Feed-Comments / Comments Update (e2e)', () => {
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

  const sampleFeedCommentsObject = {
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  describe('PATCH /feed-comments/:feedCommentId', () => {
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
      feedComments = await feedCommentsService
        .createFeedComment(
          feedPost.id,
          activeUser._id.toString(),
          sampleFeedCommentsObject.message,
          sampleFeedCommentsObject.images,
        );
    });

    it('successfully update feed comments messages', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/feed-comments/${feedComments._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(sampleFeedCommentsObject);
      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        feedPostId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        message: 'hello all test user upload your feed comments',
        userId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        images: [
        {
          image_path: 'https://picsum.photos/id/237/200/300',
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        },
        {
          image_path: 'https://picsum.photos/seed/picsum/200/300',
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        },
      ],
      });
    });

    it('when feed comment id is not exists than expected response', async () => {
      const feedComments1 = '6386f95401218469e30dbd25';
      const response = await request(app.getHttpServer())
        .patch(`/feed-comments/${feedComments1}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(sampleFeedCommentsObject)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toContain('Not found.');
    });

    it('when feed comment id and login user id is not match than expected response', async () => {
      const feedComments1 = await feedCommentsService
        .createFeedComment(
          feedPost.id,
          user0._id.toString(),
          sampleFeedCommentsObject.message,
          sampleFeedCommentsObject.images,
        );
      const response = await request(app.getHttpServer())
        .patch(`/feed-comments/${feedComments1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(sampleFeedCommentsObject);
      expect(response.body.message).toContain('Permission denied.');
    });

    describe('Validation', () => {
      it('check message length validation', async () => {
        sampleFeedCommentsObject.message = new Array(8002).join('z');
        const response = await request(app.getHttpServer())
          .patch(`/feed-comments/${feedComments._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(sampleFeedCommentsObject);
        expect(response.body.message).toContain('message cannot be longer than 8,000 characters');
      });

      it('message should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/feed-comments/${feedComments._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('message should not be empty');
      });
    });
  });
});
