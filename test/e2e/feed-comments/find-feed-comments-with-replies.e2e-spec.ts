/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
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
import getFeedCommentsResponse from '../../fixtures/comments/get-feed-comments-response';
import { FeedLikesService } from '../../../src/feed-likes/providers/feed-likes.service';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { ProfileVisibility } from '../../../src/schemas/user/user.enums';

describe('Find Feed Comments With Replies (e2e)', () => {
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
  let blocksModel: Model<BlockAndUnblockDocument>;

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
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
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

  describe('GET /feed-comments', () => {
    it('get all feed comments with reply', async () => {
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
      const feedComments2 = await feedCommentsService
        .createFeedComment(
          feedPost.id,
          activeUser._id.toString(),
          'Comment 2',
          commentImages,
        );
      await feedLikesService.createFeedCommentLike(feedComments2._id.toString(), user2._id.toString());
      await feedLikesService.createFeedCommentLike(feedComments2._id.toString(), user0._id.toString());
      await feedLikesService.createFeedCommentLike(feedComments2._id.toString(), user1._id.toString());

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
          feedComments2._id.toString(),
          activeUser._id.toString(),
          'Hello Comment 2 Test Reply Message 2',
          commentImages,
        );
      await feedLikesService.createFeedReplyLike(feedReply2._id.toString(), user0._id.toString());
      await feedLikesService.createFeedReplyLike(feedReply2._id.toString(), user1._id.toString());

      const feedReply3 = await feedCommentsService
        .createFeedReply(
          feedComments1._id.toString(),
          activeUser._id.toString(),
          'Hello Comment 1 Test Reply Message 3',
          commentImages,
        );
      await feedLikesService.createFeedReplyLike(feedReply3._id.toString(), activeUser._id.toString());
      await feedLikesService.createFeedReplyLike(feedReply3._id.toString(), user2._id.toString());

      const feedReply4 = await feedCommentsService
        .createFeedReply(
          feedComments2._id.toString(),
          activeUser._id.toString(),
          'Hello Comment 2 Test Reply Message 4',
          commentImages,
        );
      await feedLikesService.createFeedReplyLike(feedReply4._id.toString(), user0._id.toString());
      await feedLikesService.createFeedReplyLike(feedReply4._id.toString(), user3._id.toString());

      const limit = 20;
      const response = await request(app.getHttpServer())
        .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}&sortBy=newestFirst`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(getFeedCommentsResponse);
    });

    describe('when `after` argument is supplied', () => {
      beforeEach(async () => {
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
        const feedComments4 = await feedCommentsService
          .createFeedComment(
            feedPost.id,
            activeUser._id.toString(),
            'Hello Test Message 4',
            commentImages,
          );
        const feedComments5 = await feedCommentsService
          .createFeedComment(
            feedPost.id,
            activeUser._id.toString(),
            'Hello Test Message 5',
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
        await feedCommentsService
          .createFeedReply(
            feedComments4._id.toString(),
            activeUser._id.toString(),
            'Hello Test Reply Message 5',
            commentImages,
          );
        await feedCommentsService
          .createFeedReply(
            feedComments5._id.toString(),
            activeUser._id.toString(),
            'Hello Test Reply Message 6',
            commentImages,
          );
      });
      describe('get expected first and second sets of paginated results', () => {
        it('when sort is newestFirst', async () => {
          const limit = 3;
          const firstResponse = await request(app.getHttpServer())
            .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}&sortBy=newestFirst`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();
          for (let index = 1; index < firstResponse.body.length; index += 1) {
            expect(firstResponse.body[index].createdAt < firstResponse.body[index - 1].createdAt).toBe(true);
          }
          expect(firstResponse.body).toHaveLength(3);
          const secondResponse = await request(app.getHttpServer())
            .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}&sortBy=newestFirst&after=${firstResponse.body[limit - 1]._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();
          for (let index = 1; index < secondResponse.body.length; index += 1) {
            expect(secondResponse.body[index].createdAt < secondResponse.body[index - 1].createdAt).toBe(true);
          }
          expect(secondResponse.body).toHaveLength(2);
        });
        it('when sort is oldestFirst', async () => {
          const limit = 3;
          const firstResponse = await request(app.getHttpServer())
            .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}&sortBy=oldestFirst`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();
          for (let index = 1; index < firstResponse.body.length; index += 1) {
            expect(firstResponse.body[index].createdAt > firstResponse.body[index - 1].createdAt).toBe(true);
          }
          expect(firstResponse.body).toHaveLength(3);
          const secondResponse = await request(app.getHttpServer())
            .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}&sortBy=oldestFirst&after=${firstResponse.body[limit - 1]._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();
          for (let index = 1; index < secondResponse.body.length; index += 1) {
            expect(secondResponse.body[index].createdAt > secondResponse.body[index - 1].createdAt).toBe(true);
          }
          expect(secondResponse.body).toHaveLength(2);
        });
      });
    });

    it('when a block exists between the post creator and the requester, it returns the expected response', async () => {
      const user4 = await usersService.create(userFactory.build({}));
      const feedPost1 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: user4._id,
          },
        ),
      );
      await blocksModel.create({
        from: activeUser._id,
        to: user4._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const limit = 3;
      const response = await request(app.getHttpServer())
        .get(`/feed-comments?feedPostId=${feedPost1._id}&limit=${limit}&sortBy=oldestFirst`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Request failed due to user block.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    });

    describe('when the feed post was created by a user with a non-public profile', () => {
      let user5;
      let feedPost1;
      beforeEach(async () => {
        user5 = await usersService.create(userFactory.build({
          profile_status: ProfileVisibility.Private,
        }));
        feedPost1 = await feedPostsService.create(
          feedPostFactory.build(
            {
              userId: user5._id,
            },
          ),
        );
      });

      it('should not return comments when the requesting user is not a friend of the post creator', async () => {
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/feed-comments?feedPostId=${feedPost1._id}&limit=${limit}&sortBy=oldestFirst`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        expect(response.body).toEqual({ statusCode: 401, message: 'You are not friends with this user.' });
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/feed-comments?feedPostId=${feedPost._id}&sortBy=newestFirst`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}&sortBy=newestFirst`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 30', async () => {
        const limit = 31;
        const response = await request(app.getHttpServer())
          .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}&sortBy=newestFirst`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 20');
      });

      it('sortBy should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/feed-comments?feedPostId=${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('sortBy should not be empty');
      });

      it('sortBy must be an allowed value', async () => {
        const response = await request(app.getHttpServer())
          .get(`/feed-comments?feedPostId=${feedPost._id}&sortBy=banana`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('sortBy must be one of the following values: newestFirst, oldestFirst');
      });

      it('`after` must match regular expression', async () => {
        const limit = 3;
        const after = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .get(`/feed-comments?feedPostId=${feedPost._id}&limit=${limit}&after=${after}&sortBy=newestFirst`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain(
          'after must be a mongodb id',
        );
      });
    });
  });
});
