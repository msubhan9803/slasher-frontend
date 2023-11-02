import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import mongoose, { Connection, Model } from 'mongoose';
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
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { FriendsService } from '../../friends/providers/friends.service';
import { BlockAndUnblockReaction } from '../../schemas/blockAndUnblock/blockAndUnblock.enums';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../schemas/blockAndUnblock/blockAndUnblock.schema';
import { FeedReplyLike, FeedReplyLikeDocument } from '../../schemas/feedReplyLike/feedReplyLike.schema';

describe('FeedLikesService', () => {
  let app: INestApplication;
  let connection: Connection;
  let feedPostsService: FeedPostsService;
  let feedLikesService: FeedLikesService;
  let usersService: UsersService;
  let activeUser: UserDocument;
  let user0: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
  let feedPost: FeedPostDocument;
  let feedCommentsService: FeedCommentsService;
  let friendsService: FriendsService;
  let blocksModel: Model<BlockAndUnblockDocument>;
  let feedReplyLikeModel: Model<FeedReplyLikeDocument>;

  const feedCommentsAndReplyObject = {
    images: [
      {
        image_path: '/feed/feed_sample1.jpg',
        description: 'this feed likes description 1',
      },
      {
        image_path: '/feed/feed_sample2.jpg',
        description: 'this feed likes description 2',
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
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    feedReplyLikeModel = moduleRef.get<Model<FeedReplyLikeDocument>>(getModelToken(FeedReplyLike.name));

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let feedComment;
  let feedReply;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
    activeUser = await usersService.create(userFactory.build());
    user0 = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    user2 = await usersService.create(userFactory.build());

    feedPost = await feedPostsService.create(
      feedPostFactory.build(
        {
          userId: activeUser.id,
        },
      ),
    );
    await feedLikesService.createFeedPostLike(feedPost.id, activeUser.id);
    await feedLikesService.createFeedPostLike(feedPost.id, user0.id);

    feedComment = await feedCommentsService.createFeedComment(
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
          feedCommentId: feedComment.id,
          message: feedCommentsAndReplyObject.message,
          images: feedCommentsAndReplyObject.images,
        },
      ),
    );

    await feedLikesService.createFeedCommentLike(feedComment.id, activeUser.id);
    await feedLikesService.createFeedCommentLike(feedComment.id, user0.id);
    await feedLikesService.createFeedReplyLike(feedReply.id, activeUser.id);
    await feedLikesService.createFeedReplyLike(feedReply.id, user0.id);
  });

  it('should be defined', () => {
    expect(FeedLikesService).toBeDefined();
  });

  describe('#createFeedPostLike', () => {
    it('successfully creates a feed post likes.', async () => {
      const feedPostData = await feedPostsService.findByIdWithPopulatedFields(feedPost.id, false);
      expect(feedPostData.likes).toContainEqual(activeUser._id);
      expect(feedPostData.likeCount).toBe(2);
    });
  });

  describe('#findFeedPostLike', () => {
    it('successfully find a feedPostLikeData', async () => {
      const feedPostLikeData = await feedLikesService.findFeedPostLike(feedPost.id, activeUser.id);
      expect(feedPostLikeData.feedPostId).toEqual(feedPost._id);
      expect(feedPostLikeData.userId).toEqual(activeUser._id);
    });
  });

  describe('#deleteFeedPostLike', () => {
    it('successfully delete a feed post likes.', async () => {
      await feedLikesService.deleteFeedPostLike(feedPost.id, activeUser.id);
      const feedPostData = await feedPostsService.findByIdWithPopulatedFields(feedPost.id, false);
      expect(feedPostData.likes).toHaveLength(1);
      expect(feedPostData.likeCount).toBe(1);
    });
  });

  describe('#createFeedCommentLike', () => {
    it('successfully create a feed comments likes.', async () => {
      await feedLikesService.createFeedCommentLike(feedComment.id, activeUser.id);
      const feedCommentsData = await feedCommentsService.findFeedComment(feedComment.id);
      expect(feedCommentsData.likes).toContainEqual(activeUser._id);
    });
  });

  describe('#deleteFeedCommentLike', () => {
    it('successfully delete a feed comments likes.', async () => {
      await feedLikesService.deleteFeedCommentLike(feedComment.id, activeUser.id);
      const feedCommentsData = await feedCommentsService.findFeedComment(feedComment.id);
      expect(feedCommentsData.likes).toHaveLength(1);
    });
  });

  describe('#getLikeUsersForFeedComment', () => {
    beforeEach(async () => {
      feedPost = await feedPostsService.create(
        feedPostFactory.build({ userId: activeUser._id }),
      );

      // make user0 friend
      await friendsService.createFriendRequest(activeUser.id, user0.id);
      await friendsService.acceptFriendRequest(activeUser.id, user0.id);
      // make user1 friend
      await friendsService.createFriendRequest(activeUser.id, user1.id);
      await friendsService.acceptFriendRequest(activeUser.id, user1.id);
      // make user2 friend
      await friendsService.createFriendRequest(activeUser.id, user2.id);
      await friendsService.acceptFriendRequest(activeUser.id, user2.id);

      await feedLikesService.createFeedCommentLike(feedComment.id, activeUser.id);
      await feedLikesService.createFeedCommentLike(feedComment.id, user0.id);
      await feedLikesService.createFeedCommentLike(feedComment.id, user1.id);
      await feedLikesService.createFeedCommentLike(feedComment.id, user2.id);
    });

    it('successfully return list of like users for a comment', async () => {
      const limit = 2;
      const offset = 0;
      const commentData = await feedCommentsService.findFeedComment(feedComment.id.toString());
      const likeUsers1 = await feedLikesService.getLikeUsersForFeedComment(commentData, limit, offset);
      expect(likeUsers1.map((user) => user._id.toString())).toEqual(expect.arrayContaining([activeUser.id, user0.id]));

      // Pagination
      const newOffset = offset + limit;
      const likeUsers2 = await feedLikesService.getLikeUsersForFeedComment(commentData, limit, newOffset);
      expect(likeUsers2.map((user) => user._id.toString())).toEqual(expect.arrayContaining([user1.id, user2.id]));
    });

    it('successfully return list of like users along with friendStatus', async () => {
      const limit = 2;
      const offset = 0;
      const requestingContextUserId = user0.id;
      const commentData = await feedCommentsService.findFeedComment(feedComment.id.toString());
      const likeUsers = await feedLikesService.getLikeUsersForFeedComment(commentData, limit, offset, requestingContextUserId);
      expect(likeUsers.map((user) => user._id.toString())).toEqual(expect.arrayContaining([activeUser.id, user0.id]));
      expect(likeUsers[0].friendship).toEqual({
        reaction: 3,
        from: new mongoose.Types.ObjectId(activeUser.id),
        to: new mongoose.Types.ObjectId(user0.id),
      });
      expect(likeUsers[1].friendship).toBeNull();
    });

    describe('should not return users blocked by `requestingContextUser`', () => {
      beforeEach(async () => {
        await blocksModel.create({
          from: activeUser.id,
          to: user0.id,
          reaction: BlockAndUnblockReaction.Block,
        });
      });
      it('blocker user should not be returned', async () => {
        // limit=10 so that all like users are returned
        const limit = 10;
        const offset = 0;
        const requestingContextUserId = activeUser.id;
        const likeUsers = await feedLikesService.getLikeUsersForFeedComment(feedComment.id, limit, offset, requestingContextUserId);
        const allLikeUsers = likeUsers.map((user) => user._id.toString());
        expect(allLikeUsers).not.toContain(user0.id);
      });
    });
  });

  describe('#createFeedReplyLike', () => {
    it('successfully creates a feed reply like.', async () => {
      await feedLikesService.createFeedReplyLike(feedReply.id, activeUser.id);
      const feedReplyData = await feedCommentsService.findFeedReply(feedReply.id);
      expect(feedReplyData.likes).toContainEqual(activeUser._id);
    });
  });

  describe('#deleteFeedReplyLike', () => {
    it('successfully delete a feed reply like.', async () => {
      await feedLikesService.deleteFeedReplyLike(feedReply.id, activeUser.id);
      const feedReplyData = await feedCommentsService.findFeedReply(feedReply.id);
      expect(feedReplyData.likes).toHaveLength(1);
    });
  });

  describe('#getLikeUsersForFeedReply', () => {
    beforeEach(async () => {
      feedPost = await feedPostsService.create(
        feedPostFactory.build({ userId: activeUser._id }),
      );

      // make user0 friend
      await friendsService.createFriendRequest(activeUser.id, user0.id);
      await friendsService.acceptFriendRequest(activeUser.id, user0.id);
      // make user1 friend
      await friendsService.createFriendRequest(activeUser.id, user1.id);
      await friendsService.acceptFriendRequest(activeUser.id, user1.id);
      // make user2 friend
      await friendsService.createFriendRequest(activeUser.id, user2.id);
      await friendsService.acceptFriendRequest(activeUser.id, user2.id);

      await feedLikesService.createFeedReplyLike(feedReply.id, activeUser.id);
      await feedLikesService.createFeedReplyLike(feedReply.id, user0.id);
      await feedLikesService.createFeedReplyLike(feedReply.id, user1.id);
      await feedLikesService.createFeedReplyLike(feedReply.id, user2.id);
    });

    it('successfully return list of like users for a reply', async () => {
      const limit = 2;
      const offset = 0;
      const replyData = await feedCommentsService.findFeedReply(feedReply.id.toString());
      const likeUsers1 = await feedLikesService.getLikeUsersForFeedReply(replyData, limit, offset);
      expect(likeUsers1.map((user) => user._id.toString())).toEqual(expect.arrayContaining([activeUser.id, user0.id]));

      // Pagination
      const newOffset = offset + limit;
      const likeUsers2 = await feedLikesService.getLikeUsersForFeedReply(replyData, limit, newOffset);
      expect(likeUsers2.map((user) => user._id.toString())).toEqual(expect.arrayContaining([user1.id, user2.id]));
    });

    it('successfully return list of like users along with friendStatus', async () => {
      const limit = 2;
      const offset = 0;
      const requestingContextUserId = user0.id;
      const likeUsers = await feedLikesService.getLikeUsersForFeedReply(feedReply, limit, offset, requestingContextUserId);
      expect(likeUsers.map((user) => user._id.toString())).toEqual(expect.arrayContaining([activeUser.id, user0.id]));
      expect(likeUsers[0].friendship).toEqual({
        reaction: 3,
        from: new mongoose.Types.ObjectId(activeUser.id),
        to: new mongoose.Types.ObjectId(user0.id),
      });
      expect(likeUsers[1].friendship).toBeNull();
    });

    describe('should not return users blocked by `requestingContextUser`', () => {
      beforeEach(async () => {
        await blocksModel.create({
          from: activeUser.id,
          to: user0.id,
          reaction: BlockAndUnblockReaction.Block,
        });
      });
      it('blocker user should not be returned', async () => {
        // limit=10 so that all like users are returned
        const limit = 10;
        const offset = 0;
        const requestingContextUserId = activeUser.id;
        const likeUsers = await feedLikesService.getLikeUsersForFeedReply(feedReply.id, limit, offset, requestingContextUserId);
        const allLikeUsers = likeUsers.map((user) => user._id.toString());
        expect(allLikeUsers).not.toContain(user0.id);
      });
    });
  });

  describe('#deleteAllFeedPostLikeByUserId', () => {
    it('deletes all the likes of given userId', async () => {
      const feedPost1 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser.id,
          },
        ),
      );
      await feedLikesService.createFeedPostLike(feedPost.id, user0.id);
      await feedLikesService.createFeedPostLike(feedPost1.id, user0.id);
      await feedLikesService.deleteAllFeedPostLikeByUserId(user0.id);
      expect(await feedLikesService.findFeedPostLike(feedPost.id, user0.id)).toBeNull();
      expect(await feedLikesService.findFeedPostLike(feedPost1.id, user0.id)).toBeNull();
    });
  });
  describe('#deleteAllFeedReplyLikeByUserId', () => {
    it('deletes all the replies of given userId', async () => {
      const feedReply1 = await feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: activeUser._id,
            feedCommentId: feedComment._id,
          },
        ),
      );
      await feedLikesService.createFeedReplyLike(feedReply.id, user0.id);
      await feedLikesService.createFeedReplyLike(feedReply1.id, user0.id);
      await feedLikesService.deleteAllFeedReplyLikeByUserId(user0.id);
      expect(await feedReplyLikeModel.findOne({ _id: feedReply.id })).toBeNull();
      expect(await feedReplyLikeModel.findOne({ _id: feedReply1.id })).toBeNull();
    });
  });
});
