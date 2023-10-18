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
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { FeedPostDocument } from '../../../../../src/schemas/feedPost/feedPost.schema';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { FeedCommentsService } from '../../../../../src/feed-comments/providers/feed-comments.service';
import { FeedLikesService } from '../../../../../src/feed-likes/providers/feed-likes.service';
import findOneFeedCommentsResponse from '../../../../fixtures/comments/find-one-feed-comments-response';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';
import { feedCommentsFactory } from '../../../../factories/feed-comments.factory';
import { feedRepliesFactory } from '../../../../factories/feed-reply.factory';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Find Single Feed Comments With Replies (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let user0: User;
  let user1: User;
  let user3: User;
  let user2: User;
  let user6: User;
  let configService: ConfigService;
  let feedPost: FeedPostDocument;
  let feedPostsService: FeedPostsService;
  let feedCommentsService: FeedCommentsService;
  let feedLikesService: FeedLikesService;
  let blocksModel: Model<BlockAndUnblockDocument>;

  const commentImages = [
    {
      image_path: 'https://picsum.photos/id/237/200/300',
      description: 'this is feed comment with replies description 1',
    },
    {
      image_path: 'https://picsum.photos/seed/picsum/200/300',
      description: 'this is feed comment with replies description 2',
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
    user6 = await usersService.create(userFactory.build({
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
    await blocksModel.create({
      from: activeUser._id,
      to: user6._id,
      reaction: BlockAndUnblockReaction.Block,
    });
  });

  describe('GET /api/v1/feed-comments/:feedCommentId', () => {
    it('requires authentication', async () => {
      const feedCommentId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).get(`/api/v1/feed-comments/${feedCommentId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('get single feed comments with reply', async () => {
      const feedComments1 = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: activeUser._id,
            feedPostId: feedPost.id,
            message: 'Comment 1',
            images: commentImages,
          },
        ),
      );
      await feedLikesService.createFeedCommentLike(feedComments1._id.toString(), activeUser._id.toString());
      await feedLikesService.createFeedCommentLike(feedComments1._id.toString(), user0._id.toString());
      await feedLikesService.createFeedCommentLike(feedComments1._id.toString(), user1._id.toString());
      await feedLikesService.createFeedCommentLike(feedComments1._id.toString(), user2._id.toString());
      await feedLikesService.createFeedCommentLike(feedComments1._id.toString(), user3._id.toString());

      const feedReply1 = await feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: activeUser._id,
            feedCommentId: feedComments1.id,
            message: 'Hello Comment 1 Test Reply Message 1',
            images: commentImages,
          },
        ),
      );
      await feedLikesService.createFeedReplyLike(feedReply1._id.toString(), activeUser._id.toString());
      await feedLikesService.createFeedReplyLike(feedReply1._id.toString(), user0._id.toString());

      const feedReply2 = await feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: activeUser._id,
            feedCommentId: feedComments1.id,
            message: 'Hello Comment 1 Test Reply Message 2',
            images: commentImages,
          },
        ),
      );

      await feedLikesService.createFeedReplyLike(feedReply2._id.toString(), user1._id.toString());
      await feedLikesService.createFeedReplyLike(feedReply2._id.toString(), user0._id.toString());

      await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: user6._id,
            feedPostId: feedPost._id,
            message: 'This is block user comment',
            images: commentImages,
          },
        ),
      );
      await feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: user6._id,
            feedCommentId: feedComments1.id,
            message: 'This is block user reply',
            images: commentImages,
          },
        ),
      );

      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-comments/${feedComments1._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual(findOneFeedCommentsResponse);
    });

    it('when feed comment id is not exists than expected response.', async () => {
      const feedCommentsId = '63940f0016e1db19bf32e72a';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-comments/${feedCommentsId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Comment not found');
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
      const feedComments1 = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: activeUser._id,
            feedPostId: feedPost1.id,
            message: 'hello test user',
            images: commentImages,
          },
        ),
      );
      await blocksModel.create({
        from: activeUser._id.toString(),
        to: user4._id.toString(),
        reaction: BlockAndUnblockReaction.Block,
      });
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-comments/${feedComments1._id}`)
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
      let feedComment1;
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
        feedComment1 = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: user5._id,
              feedPostId: feedPost1.id,
              message: 'hello test user',
              images: commentImages,
            },
          ),
        );
      });

      it('should not return the comment when the requesting user is not a friend of the post creator', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-comments/${feedComment1._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body).toEqual({ statusCode: 403, message: 'You must be friends with this user to perform this action.' });
      });
    });

    describe('Validation', () => {
      it('feedCommentId must be a mongodb id', async () => {
        const feedCommentId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/feed-comments/${feedCommentId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'feedCommentId must be a mongodb id',
        );
      });
    });
  });
});
