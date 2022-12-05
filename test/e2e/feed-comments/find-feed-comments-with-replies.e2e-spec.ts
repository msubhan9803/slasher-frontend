import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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

describe('Find Feed Comments With Replies (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPost: FeedPostDocument;
  let feedPostsService: FeedPostsService;
  let feedCommentsService: FeedCommentsService;

  const sampleFindFeedCommentsWithRepliesObject = {
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
    activeUser = await usersService.create(userFactory.build());
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

  describe('GET /feed-comments', () => {
    it('get all feed comments with reply', async () => {
      const message = ['Hello Test Reply Message 1', 'Hello Test Reply Message 2', 'Hello Test Reply Message 3'];
      const feedComments1 = await feedCommentsService
        .createFeedComment(
          feedPost.id,
          activeUser._id.toString(),
          sampleFindFeedCommentsWithRepliesObject.message,
          sampleFindFeedCommentsWithRepliesObject.images,
        );
      const feedComments2 = await feedCommentsService
        .createFeedComment(
          feedPost.id,
          activeUser._id.toString(),
          sampleFindFeedCommentsWithRepliesObject.message,
          sampleFindFeedCommentsWithRepliesObject.images,
        );
      for (let i = 0; i < 3; i += 1) {
        await feedCommentsService
          .createFeedReply(
            feedComments1._id.toString(),
            activeUser._id.toString(),
            message[i],
            sampleFindFeedCommentsWithRepliesObject.images,
          );
      }
      await feedCommentsService
        .createFeedReply(
          feedComments2._id.toString(),
          activeUser._id.toString(),
          'Hello Test Reply Message 4',
          sampleFindFeedCommentsWithRepliesObject.images,
        );
      const limit = 20;
      const response = await request(app.getHttpServer())
        .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(2);
    });

    describe('when `before` argument is supplied', () => {
      it('get expected first and second sets of paginated results', async () => {
        const feedComments1 = await feedCommentsService
          .createFeedComment(
            feedPost.id,
            activeUser._id.toString(),
            'Hello Test Message 1',
            sampleFindFeedCommentsWithRepliesObject.images,
          );
        const feedComments2 = await feedCommentsService
          .createFeedComment(
            feedPost.id,
            activeUser._id.toString(),
            'Hello Test Message 2',
            sampleFindFeedCommentsWithRepliesObject.images,
          );
        const feedComments3 = await feedCommentsService
          .createFeedComment(
            feedPost.id,
            activeUser._id.toString(),
            'Hello Test Message 3',
            sampleFindFeedCommentsWithRepliesObject.images,
          );
        await feedCommentsService
          .createFeedReply(
            feedComments1._id.toString(),
            activeUser._id.toString(),
            'Hello Test Reply Message 1',
            sampleFindFeedCommentsWithRepliesObject.images,
          );
        await feedCommentsService
          .createFeedReply(
            feedComments2._id.toString(),
            activeUser._id.toString(),
            'Hello Test Reply Message 2',
            sampleFindFeedCommentsWithRepliesObject.images,
          );
        await feedCommentsService
          .createFeedReply(
            feedComments3._id.toString(),
            activeUser._id.toString(),
            'Hello Test Reply Message 3',
            sampleFindFeedCommentsWithRepliesObject.images,
          );
        await feedCommentsService
          .createFeedReply(
            feedComments3._id.toString(),
            activeUser._id.toString(),
            'Hello Test Reply Message 4',
            sampleFindFeedCommentsWithRepliesObject.images,
          );
        const limit = 2;
        const firstResponse = await request(app.getHttpServer())
          .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        for (let index = 1; index < firstResponse.body.length; index += 1) {
          expect(firstResponse.body[index].createdAt < firstResponse.body[index - 1].createdAt).toBe(true);
        }
        expect(firstResponse.body).toHaveLength(2);
        const secondResponse = await request(app.getHttpServer())
          .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}&before=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        for (let index = 1; index < secondResponse.body.length; index += 1) {
          expect(secondResponse.body[index].createdAt < secondResponse.body[index - 1].createdAt).toBe(true);
        }
        expect(secondResponse.body).toHaveLength(1);
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/feed-comments?feedPostId=${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 30', async () => {
        const limit = 31;
        const response = await request(app.getHttpServer())
          .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 20');
      });

      it('`before` must match regular expression', async () => {
        const limit = 3;
        const before = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}&before=${before}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain(
          'before must be a mongodb id',
        );
      });
    });
  });
});
