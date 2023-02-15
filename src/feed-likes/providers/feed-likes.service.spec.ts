import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { userFactory } from '../../../test/factories/user.factory';
import { UsersService } from '../../users/providers/users.service';
import { FeedLikesService } from './feed-likes.service';
import { FeedPostsService } from '../../feed-posts/providers/feed-posts.service';
import { UserDocument } from '../../schemas/user/user.schema';
import { FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { feedPostFactory } from '../../../test/factories/feed-post.factory';
import { FeedCommentsService } from '../../feed-comments/providers/feed-comments.service';
import { feedCommentsFactory } from '../../../test/factories/feed-comments.factory';
import { feedRepliesFactory } from '../../../test/factories/feed-reply.factory';

describe('FeedLikesService', () => {
  let app: INestApplication;
  let connection: Connection;
  let feedPostsService: FeedPostsService;
  let feedLikesService: FeedLikesService;
  let usersService: UsersService;
  let activeUser: UserDocument;
  let user0: UserDocument;
  let feedPost: FeedPostDocument;
  let feedCommentsService: FeedCommentsService;

  const feedCommentsAndReplyObject = {
    images: [
      {
        image_path: 'https://picsum.photos/id/237/200/300',
      },
      {
        image_path: 'https://picsum.photos/seed/picsum/200/300',
      },
    ],
    message: 'Hello Test Message',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    feedLikesService = moduleRef.get<FeedLikesService>(FeedLikesService);
    feedCommentsService = moduleRef.get<FeedCommentsService>(FeedCommentsService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let feedComments; let
feedReply;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    activeUser = await usersService.create(userFactory.build());
    user0 = await usersService.create(userFactory.build());
    feedPost = await feedPostsService.create(
      feedPostFactory.build(
        {
          userId: activeUser.id,
        },
      ),
    );
    await feedLikesService.createFeedPostLike(feedPost.id, activeUser.id);
    await feedLikesService.createFeedPostLike(feedPost.id, user0.id);

    feedComments = await feedCommentsService.createFeedComment(
      feedCommentsFactory.build(
        {
          userId: activeUser._id,
          feedPostId: feedPost.id,
          message: feedCommentsAndReplyObject.message,
          images: feedCommentsAndReplyObject.images,
        },
      ),
    );
    feedReply = await feedCommentsService.createFeedReply(
      feedRepliesFactory.build(
        {
          userId: activeUser._id,
          feedCommentId: feedComments.id,
          message: feedCommentsAndReplyObject.message,
          images: feedCommentsAndReplyObject.images,
        },
      ),
    );

    await feedLikesService.createFeedCommentLike(feedComments.id, activeUser.id);
    await feedLikesService.createFeedCommentLike(feedComments.id, user0.id);
    await feedLikesService.createFeedReplyLike(feedReply.id, activeUser.id);
    await feedLikesService.createFeedReplyLike(feedReply.id, user0.id);
  });

  it('should be defined', () => {
    expect(FeedLikesService).toBeDefined();
  });

  describe('#createFeedPostLike', () => {
    it('successfully creates a feed post likes.', async () => {
      const feedPostData = await feedPostsService.findById(feedPost.id, false);
      expect(feedPostData.likes).toContainEqual(activeUser._id);
      expect(feedPostData.likeCount).toBe(2);
    });

    it('when feed post id is not found', async () => {
      await expect(feedLikesService.createFeedPostLike('634fc8986a5897b88a2d971b', activeUser.id)).rejects.toThrow('Post not found.');
    });
  });

  describe('#deleteFeedPostLike', () => {
    it('successfully delete a feed post likes.', async () => {
      await feedLikesService.deleteFeedPostLike(feedPost.id, activeUser.id);
      const feedPostData = await feedPostsService.findById(feedPost.id, false);
      expect(feedPostData.likes).toHaveLength(1);
      expect(feedPostData.likeCount).toBe(1);
    });

    it('when feed post id is not found', async () => {
      await expect(feedLikesService.deleteFeedPostLike('634fc8986a5897b88a2d971b', activeUser.id)).rejects.toThrow('Post not found.');
    });
  });

  describe('#createFeedCommentLike', () => {
    it('successfully create a feed comments likes.', async () => {
      await feedLikesService.createFeedCommentLike(feedComments.id, activeUser.id);
      const feedCommentsData = await feedCommentsService.findFeedComment(feedComments.id);
      expect(feedCommentsData.likes).toContainEqual(activeUser._id);
    });

    it('when feed comments id is not found', async () => {
      await expect(feedLikesService.createFeedCommentLike('634fc8986a5897b88a2d971b', activeUser.id)).rejects.toThrow('Comment not found.');
    });
  });

  describe('#deleteFeedCommentLike', () => {
    it('successfully delete a feed comments likes.', async () => {
      await feedLikesService.deleteFeedCommentLike(feedComments.id, activeUser.id);
      const feedCommentsData = await feedCommentsService.findFeedComment(feedComments.id);
      expect(feedCommentsData.likes).toHaveLength(1);
    });

    it('when feed comments id is not found', async () => {
      await expect(feedLikesService.deleteFeedCommentLike('634fc8986a5897b88a2d971b', activeUser.id)).rejects.toThrow('Comment not found.');
    });
  });

  describe('#createFeedReplyLike', () => {
    it('successfully creates a feed reply like.', async () => {
      await feedLikesService.createFeedReplyLike(feedReply.id, activeUser.id);
      const feedReplyData = await feedCommentsService.findFeedReply(feedReply.id);
      expect(feedReplyData.likes).toContainEqual(activeUser._id);
    });

    it('when feed reply id is not found', async () => {
      await expect(feedLikesService.createFeedReplyLike('634fc8986a5897b88a2d971b', activeUser.id)).rejects.toThrow('Reply not found.');
    });
  });

  describe('#deleteFeedReplyLike', () => {
    it('successfully delete a feed reply like.', async () => {
      await feedLikesService.deleteFeedReplyLike(feedReply.id, activeUser.id);
      const feedReplyData = await feedCommentsService.findFeedReply(feedReply.id);
      expect(feedReplyData.likes).toHaveLength(1);
    });

    it('when feed reply id is not found', async () => {
      await expect(feedLikesService.deleteFeedReplyLike('634fc8986a5897b88a2d971b', activeUser.id)).rejects.toThrow('Reply not found.');
    });
  });
});
