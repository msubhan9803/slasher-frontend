import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { FeedPostDocument } from '../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { FeedCommentsService } from '../../../src/feed-comments/providers/feed-comments.service';
import { FeedComment, FeedCommentDocument } from '../../../src/schemas/feedComment/feedComment.schema';
import { FeedReply, FeedReplyDocument } from '../../../src/schemas/feedReply/feedReply.schema';
import getFeedCommentsResponse from '../../fixtures/comments/get-feed-comments-response';

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
  let feedCommentModel: Model<FeedCommentDocument>;
  let feedReplyModel: Model<FeedReplyDocument>;

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
    feedCommentModel = moduleRef.get<Model<FeedCommentDocument>>(getModelToken(FeedComment.name));
    feedReplyModel = moduleRef.get<Model<FeedReplyDocument>>(getModelToken(FeedReply.name));
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
      const feedComments1 = await feedCommentModel.create({
        feedPostId: feedPost.id,
        userId: activeUser._id.toString(),
        message: 'Comment 1',
        images: commentImages,
        likes: [
          '637b39e078b0104f975821bc',
          '637b39e078b0104f975821bd',
          '637b39e078b0104f975821be',
          '637b39e078b0104f97582121',
          activeUser._id.toString(),
        ],
      });
      const feedComments2 = await feedCommentModel.create({
        feedPostId: feedPost.id,
        userId: activeUser._id.toString(),
        message: 'Comment 2',
        images: commentImages,
        likes: [
          '637b39e078b0104f975821bf',
          '637b39e078b0104f975821bg',
          '637b39e078b0104f975821bh',
        ],
      });

      for (let i = 1; i <= 2; i += 1) {
        await feedReplyModel.create({
          feedCommentId: feedComments1._id.toString(),
          userId: activeUser._id.toString(),
          message: `Hello Comment 1 Test Reply Message ${i}`,
          images: commentImages,
          likes: [
            '63772b35611dc46e8fb42102',
            activeUser._id.toString(),
          ],
        });
      }
      for (let i = 1; i <= 2; i += 1) {
        await feedReplyModel.create({
          feedCommentId: feedComments2._id.toString(),
          userId: activeUser._id.toString(),
          message: `Hello Comment 2 Test Reply Message ${i}`,
          images: commentImages,
          likes: [
            '63772b35611dc46e8fb44455',
            '63772b35611dc46e8fb45566',
          ],
        });
      }

      const limit = 20;
      const response = await request(app.getHttpServer())
        .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(getFeedCommentsResponse);
    });

    describe('when `before` argument is supplied', () => {
      it('get expected first and second sets of paginated results', async () => {
        const feedComments1 = await feedCommentsService
          .createFeedComment(
            feedPost.id,
            activeUser._id.toString(),
            'Hello Test Message 1',
            commentImages,
          );
        const feedComments2 = await feedCommentsService
          .createFeedComment(
            feedPost.id,
            activeUser._id.toString(),
            'Hello Test Message 2',
            commentImages,
          );
        const feedComments3 = await feedCommentsService
          .createFeedComment(
            feedPost.id,
            activeUser._id.toString(),
            'Hello Test Message 3',
            commentImages,
          );
        await feedCommentsService
          .createFeedReply(
            feedComments1._id.toString(),
            activeUser._id.toString(),
            'Hello Test Reply Message 1',
            commentImages,
          );
        await feedCommentsService
          .createFeedReply(
            feedComments2._id.toString(),
            activeUser._id.toString(),
            'Hello Test Reply Message 2',
            commentImages,
          );
        await feedCommentsService
          .createFeedReply(
            feedComments3._id.toString(),
            activeUser._id.toString(),
            'Hello Test Reply Message 3',
            commentImages,
          );
        await feedCommentsService
          .createFeedReply(
            feedComments3._id.toString(),
            activeUser._id.toString(),
            'Hello Test Reply Message 4',
            commentImages,
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
