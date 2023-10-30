/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import mongoose, { Connection, Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { FeedCommentsService } from './feed-comments.service';
import { userFactory } from '../../../test/factories/user.factory';
import { UsersService } from '../../users/providers/users.service';
import { FeedPostsService } from '../../feed-posts/providers/feed-posts.service';
import { UserDocument } from '../../schemas/user/user.schema';
import { FeedComment, FeedCommentDocument } from '../../schemas/feedComment/feedComment.schema';
import { FeedReply, FeedReplyDocument } from '../../schemas/feedReply/feedReply.schema';
import { FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { feedPostFactory } from '../../../test/factories/feed-post.factory';
import { FeedCommentDeletionState } from '../../schemas/feedComment/feedComment.enums';
import { FeedReplyDeletionState } from '../../schemas/feedReply/feedReply.enums';
import { feedCommentsFactory } from '../../../test/factories/feed-comments.factory';
import { feedRepliesFactory } from '../../../test/factories/feed-reply.factory';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../schemas/blockAndUnblock/blockAndUnblock.enums';
import { BlocksService } from '../../blocks/providers/blocks.service';
import { CommentsSortBy } from '../../types';

describe('FeedCommentsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let feedCommentsService: FeedCommentsService;
  let feedPostsService: FeedPostsService;
  let usersService: UsersService;
  let blocksService: BlocksService;
  let activeUser: UserDocument;
  let feedPost: FeedPostDocument;
  let feedCommentsModel: Model<FeedCommentDocument>;
  let feedReplyModel: Model<FeedReplyDocument>;
  let blocksModel: Model<BlockAndUnblockDocument>;

  const sampleFeedCommentsObject = {
    images: [
      {
        image_path: '/feed/feed_sample1.jpg',
        description: 'this feed comment description',
      },
      {
        image_path: '/feed/feed_sample2.jpg',
        description: 'this feed comment description',
      },
    ],
    message: 'Hello Test Message',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    feedCommentsService = moduleRef.get<FeedCommentsService>(FeedCommentsService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    feedCommentsModel = moduleRef.get<Model<FeedCommentDocument>>(getModelToken(FeedComment.name));
    feedReplyModel = moduleRef.get<Model<FeedReplyDocument>>(getModelToken(FeedReply.name));
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    blocksService = moduleRef.get<BlocksService>(BlocksService);

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let feedComments;
  let feedReply;
  let feedPost1;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
    activeUser = await usersService.create(userFactory.build());
    feedPost = await feedPostsService.create(
      feedPostFactory.build(
        {
          userId: activeUser.id,
        },
      ),
    );
    feedPost1 = await feedPostsService.create(
      feedPostFactory.build(
        {
          userId: activeUser.id,
        },
      ),
    );
    feedComments = await feedCommentsService.createFeedComment(
      feedCommentsFactory.build(
        {
          userId: activeUser._id,
          feedPostId: feedPost.id,
        },
      ),
    );
    feedReply = await feedCommentsService.createFeedReply(
      feedRepliesFactory.build(
        {
          userId: activeUser._id,
          feedCommentId: feedComments.id,
          message: sampleFeedCommentsObject.message,
          images: sampleFeedCommentsObject.images,
        },
      ),
    );
  });

  it('should be defined', () => {
    expect(feedCommentsService).toBeDefined();
  });

  describe('#createFeedComment', () => {
    it('successfully creates a feed comments.', async () => {
      const feedCommentData = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: activeUser._id,
            feedPostId: feedPost.id,
            message: 'Hello Test Message',
          },
        ),
      );
      expect(feedCommentData.message).toBe('Hello Test Message');
      const feedPostsData = await feedPostsService.findById(feedPost.id, false);
      expect(feedPostsData.commentCount).toBe(2);
    });
  });

  describe('#updateFeedComment', () => {
    it('finds the expected comments and update the details', async () => {
      const feedCommentsJson = {
        message: 'Hello Test Message 2',
        images: [
          {
            image_path: '/feed/feed_sample1.jpg',
            description: 'this feed comment description',
          },
          {
            image_path: '/feed/feed_sample2.jpg',
            description: 'this feed comment description',
          },
        ],
      };
      const updatedComment = await feedCommentsService.updateFeedComment(feedComments._id.toString(), feedCommentsJson);
      const feedCommentData = await feedCommentsModel.findById(updatedComment._id);
      expect(feedCommentData.message).toEqual(feedCommentsJson.message);
      expect(feedCommentData.images.map((el) => el.image_path)).toEqual(feedCommentsJson.images.map((el) => el.image_path));
    });
  });

  describe('#updateMessageInFeedcomments', () => {
    it('updates the username in message key and returns the expected response', async () => {
      const user = await usersService.create(userFactory.build());
      const feedComment = await feedCommentsService.createFeedComment(feedCommentsFactory.build({
        userId: activeUser.id,
        feedPostId: feedPost1.id,
        message: `new comment 1 ##LINK_ID##${activeUser.id}@slasher##LINK_END## new comment`,
        is_deleted: 0,
      }));
      const feedComment1 = await feedCommentsService.createFeedComment(feedCommentsFactory.build({
        userId: activeUser.id,
        feedPostId: feedPost1.id,
        message: `new comment 3 ##LINK_ID##${activeUser.id}@devid##LINK_END## comments`,
        is_deleted: 0,
      }));
      await feedCommentsService.createFeedComment(feedCommentsFactory.build({
        userId: user.id,
        feedPostId: feedPost1.id,
        message: `new comment 2 ##LINK_ID##${user.id}@john##LINK_END## comments`,
        is_deleted: 0,
      }));

      await feedCommentsService.updateMessageInFeedcomments(activeUser.id, 'horror');
      expect(
        ((await feedCommentsModel.findById(feedComment.id))).message,
      ).toBe(`new comment 1 ##LINK_ID##${activeUser.id}@horror##LINK_END## new comment`);
      expect(
        ((await feedCommentsModel.findById(feedComment1.id))).message,
      ).toBe(`new comment 3 ##LINK_ID##${activeUser.id}@horror##LINK_END## comments`);
    });
  });

  describe('#deleteFeedComment', () => {
    it('finds the expected comments and delete the details', async () => {
      await feedCommentsService.deleteFeedComment(feedComments.id);
      const feedCommentData = await feedCommentsModel.findById(feedComments._id);
      expect(feedCommentData.is_deleted).toEqual(FeedCommentDeletionState.Deleted);
    });

    it('when feedCommentId equals the comment _id than deleting comment and replies', async () => {
      const reply1 = await feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: activeUser._id,
            feedCommentId: feedComments.id,
            message: sampleFeedCommentsObject.message,
            images: sampleFeedCommentsObject.images,
          },
        ),
      );
      await feedCommentsService.deleteFeedComment(feedComments.id);
      const feedCommentData = await feedCommentsModel.findById(feedComments._id);
      expect(feedCommentData.is_deleted).toEqual(FeedCommentDeletionState.Deleted);
      const feedreplyData1 = await feedReplyModel.findOne({ _id: feedReply._id });
      expect(feedreplyData1.deleted).toEqual(FeedReplyDeletionState.Deleted);
      const feedreplyData2 = await feedReplyModel.findOne({ _id: reply1._id });
      expect(feedreplyData2.deleted).toEqual(FeedReplyDeletionState.Deleted);
    });
  });

  describe('#createFeedReply', () => {
    it('successfully creates a feed replies.', async () => {
      const feedReplyData = await feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: activeUser._id,
            feedCommentId: feedComments.id,
            message: sampleFeedCommentsObject.message,
            images: sampleFeedCommentsObject.images,
          },
        ),
      );

      expect(feedReplyData.feedCommentId).toEqual(feedComments._id);
    });

    it('when feed comment id is not found', async () => {
      const feedCommentId = '634fc8986a5897b88a2d971b';

      await expect(feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: activeUser._id,
            feedCommentId: (feedCommentId) as any,
            message: sampleFeedCommentsObject.message,
            images: sampleFeedCommentsObject.images,
          },
        ),
      )).rejects.toThrow(`Comment with id ${feedCommentId} not found`);
    });
  });

  describe('#updateFeedReply', () => {
    it('finds the expected replies and update the details', async () => {
      const feedReplyJson = {
        message: 'Hello Test Message 2',
        images: [
          {
            image_path: '/feed/feed_sample1.jpg',
            description: 'this feed comment description',

          },
          {
            image_path: '/feed/feed_sample2.jpg',
            description: 'this feed comment description',
          },
        ],
      };
      const updatedReply = await feedCommentsService.updateFeedReply(feedReply.id, feedReplyJson);
      const feedReplyData = await feedReplyModel.findById(updatedReply._id);
      expect(feedReplyData.message).toEqual(feedReplyJson.message);
      expect(feedReplyData.images.map((el) => el.image_path)).toEqual(feedReplyJson.images.map((el) => el.image_path));
    });
  });

  describe('#updateMessageInFeedreplies', () => {
    it('updates the username in message key and returns the expected response', async () => {
      const user = await usersService.create(userFactory.build());
      const feedReply1 = await feedCommentsService.createFeedReply(feedRepliesFactory.build({
        feedCommentId: feedComments.id,
        userId: activeUser.id,
        message: `new reply ##LINK_ID##${activeUser.id}@slasher##LINK_END##  #reply`,
        deleted: 0,
      }));
      const feedReply2 = await feedCommentsService.createFeedReply(feedRepliesFactory.build({
        feedCommentId: feedComments.id,
        userId: activeUser.id,
        message: `new reply 1 ##LINK_ID##${activeUser.id}@horror##LINK_END##  #reply1`,
        deleted: 0,
      }));
      await feedCommentsService.createFeedReply(feedRepliesFactory.build({
        feedCommentId: feedComments.id,
        userId: user.id,
        message: `new reply 2 ##LINK_ID##${user.id}@john##LINK_END##  #reply`,
        deleted: 0,
      }));

      await feedCommentsService.updateMessageInFeedreplies(activeUser.id, 'ghost');
      expect(
        ((await feedReplyModel.findById(feedReply1.id))).message,
      ).toBe(`new reply ##LINK_ID##${activeUser.id}@ghost##LINK_END##  #reply`);
      expect(
        ((await feedReplyModel.findById(feedReply2.id))).message,
      ).toBe(`new reply 1 ##LINK_ID##${activeUser.id}@ghost##LINK_END##  #reply1`);
    });
  });

  describe('#deleteFeedReply', () => {
    it('finds the expected reply and delete the details', async () => {
      await feedCommentsService.deleteFeedReply(feedReply.id);
      const feedReplyData = await feedReplyModel.findById(feedReply._id);
      expect(feedReplyData.deleted).toEqual(FeedReplyDeletionState.Deleted);
    });
  });

  describe('#findFeedCommentsWithReplies', () => {
    let user0;
    let user1;
    let excludedUserIds;
    beforeEach(async () => {
      user0 = await usersService.create(userFactory.build());
      user1 = await usersService.create(userFactory.build());
      await blocksModel.create({
        from: user0._id,
        to: user1._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      excludedUserIds = await blocksService.getUserIdsForBlocksToOrFromUser(user0.id);
    });

    it('finds the expected comments and delete the details', async () => {
      const messages = ['Hello Test Reply Message 1', 'Hello Test Reply Message 2', 'Hello Test Reply Message 3'];
      const feedComments1 = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: activeUser.id,
            feedPostId: feedPost.id,
          },
        ),
      );
      const feedComments2 = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: activeUser.id,
            feedPostId: feedPost.id,
          },
        ),
      );
      //this is block user comment
      await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: user1.id,
            feedPostId: feedPost.id,
          },
        ),
      );
      for (let i = 0; i < 3; i += 1) {
        await feedCommentsService.createFeedReply(
          feedRepliesFactory.build(
            {
              userId: activeUser.id,
              feedCommentId: feedComments1.id,
              message: messages[i],
              images: sampleFeedCommentsObject.images,
            },
          ),
        );
      }
      await feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: activeUser.id,
            feedCommentId: feedComments2.id,
            message: 'Hello Test Reply Message 4',
            images: sampleFeedCommentsObject.images,
          },
        ),
      );
      //this is block user reply
      await feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: user1.id,
            feedCommentId: feedComments2.id,
            message: 'Hello Test Reply Message 4',
            images: sampleFeedCommentsObject.images,
          },
        ),
      );
      const feedCommentsWithReplies = await feedCommentsService.findFeedCommentsWithReplies(
        feedPost.id,
        20,
        'newestFirst',
        excludedUserIds,
      );
      expect(feedCommentsWithReplies).toHaveLength(3);
    });

    it('when add identifylikesforuser than expected response', async () => {
      const feedComments1 = await feedCommentsModel.create({
        feedPostId: feedPost1.id,
        userId: activeUser.id,
        message: sampleFeedCommentsObject.message,
        images: sampleFeedCommentsObject.images,
        likes: [
          '637b39e078b0104f975821bc',
          '637b39e078b0104f975821bd',
          '637b39e078b0104f975821be',
          '637b39e078b0104f97582121',
          activeUser.id,
        ],
      });
      const feedComments2 = await feedCommentsModel.create({
        feedPostId: feedPost1.id,
        userId: activeUser.id,
        message: sampleFeedCommentsObject.message,
        images: sampleFeedCommentsObject.images,
        likes: [
          '637b39e078b0104f975821bf',
          '637b39e078b0104f975821bg',
          '637b39e078b0104f975821bh',
          activeUser.id,
        ],
      });
      //this is block user comment
      await feedCommentsModel.create({
        feedPostId: feedPost1.id,
        userId: user1.id,
        message: sampleFeedCommentsObject.message,
        images: sampleFeedCommentsObject.images,
        likes: [
          '637b39e078b0104f975821bf',
          '637b39e078b0104f975821bg',
          '637b39e078b0104f975821bh',
          activeUser.id,
        ],
      });

      for (let i = 0; i < 2; i += 1) {
        await feedReplyModel.create({
          feedCommentId: feedComments1._id.toString(),
          userId: activeUser.id,
          message: 'Hello Test Reply Message 1',
          images: sampleFeedCommentsObject.images,
          likes: [
            '63772b35611dc46e8fb42102',
            activeUser.id,
          ],
        });
      }
      await feedReplyModel.create({
        feedCommentId: feedComments2._id.toString(),
        userId: activeUser.id,
        message: 'Hello Test Reply Message 4',
        images: sampleFeedCommentsObject.images,
        likes: [
          '63772b35611dc46e8fb44455',
          '63772b35611dc46e8fb45566',
          activeUser.id,
        ],
      });

      await feedReplyModel.create({
        feedCommentId: feedComments2._id.toString(),
        userId: activeUser.id,
        message: 'Hello Test Reply Message 5',
        images: sampleFeedCommentsObject.images,
        likes: [
          '63772b35611dc46e8fb44455',
          '63772b35611dc46e8fb45566',
        ],
      });

      await feedReplyModel.create({
        feedCommentId: feedComments2._id.toString(),
        userId: user1.id,
        message: 'Hello Test Reply Message 5',
        images: sampleFeedCommentsObject.images,
        likes: [
          '63772b35611dc46e8fb44455',
          '63772b35611dc46e8fb45566',
        ],
      });

      // Run for both 'newestFirst' and 'oldestFirst'
      for await (const SORT_BY of CommentsSortBy) {
        // for await (const SORT_BY of CommentsSortBy) { // original
        const sortClause: any = {
          createdAt: (SORT_BY === 'newestFirst' ? -1 : 1),
        };

        const getFeedPostData = await feedCommentsModel.find({
          $and: [
            { feedPostId: feedPost1._id },
            { userId: { $nin: excludedUserIds } },
          ],
        })
          .sort(sortClause);
        const getFeedReplyData = await feedReplyModel.find({
          $and: [
            {
              feedCommentId:
                { $in: [feedComments1._id.toString(), feedComments2._id.toString()] },
            },
            { userId: { $nin: excludedUserIds } },
          ],
        });
        const userData = await usersService.findById(activeUser.id, true);

        const feedCommentsWithReplies = await feedCommentsService.findFeedCommentsWithReplies(
          feedPost1.id,
          20,
          SORT_BY,
          excludedUserIds,
          activeUser.id,
        );

        const feedCommentAndReply = JSON.parse(JSON.stringify(getFeedPostData));
        const replyData = JSON.parse(JSON.stringify(getFeedReplyData));
        for (let i = 0; i < feedCommentAndReply.length; i += 1) {
          const filterReply = replyData
            .filter((replyId) => replyId.feedCommentId === feedCommentAndReply[i]._id)
            .map((replyId) => {// eslint-disable-line
              // eslint-disable-next-line no-param-reassign
              replyId.likedByUser = replyId.likes.includes(activeUser.id);
              // eslint-disable-next-line no-param-reassign
              replyId.userId = { _id: userData._id.toString(), profilePic: userData.profilePic, userName: userData.userName };
              return replyId;
            });
          feedCommentAndReply[i].likedByUser = feedCommentAndReply[i].likes.includes(activeUser.id);
          feedCommentAndReply[i].userId = { _id: userData._id.toString(), profilePic: userData.profilePic, userName: userData.userName };
          feedCommentAndReply[i].replies = filterReply;
        }
        if (SORT_BY === 'newestFirst') {
          feedCommentAndReply.sort((a, b) => -a.createdAt.localeCompare(b.createdAt));
        } else {
          feedCommentAndReply.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        }
        expect(feedCommentsWithReplies).toHaveLength(2);
        // expect(feedCommentsWithReplies).toEqual(feedCommentAndReply); // original
        expect(feedCommentsWithReplies[0]._id).toEqual(feedCommentAndReply[0]._id);
        expect(feedCommentsWithReplies[1]._id).toEqual(feedCommentAndReply[1]._id);
        expect(feedCommentsWithReplies[1]).toEqual(feedCommentAndReply[1]);
      }
    });

    describe('when `before` argument is supplied', () => {
      it('get expected first and second sets of paginated results', async () => {
        const feedComments1 = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: activeUser.id,
              feedPostId: feedPost.id,
              message: 'Hello Test Message 1',
            },
          ),
        );
        const feedComments2 = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: activeUser.id,
              feedPostId: feedPost.id,
              message: 'Hello Test Message 2',
            },
          ),
        );
        const feedComments3 = await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: activeUser.id,
              feedPostId: feedPost.id,
              message: 'Hello Test Message 3',
            },
          ),
        );
        //this is block user comment
        await feedCommentsService.createFeedComment(
          feedCommentsFactory.build(
            {
              userId: user1.id,
              feedPostId: feedPost.id,
            },
          ),
        );
        await feedCommentsService.createFeedReply(
          feedRepliesFactory.build(
            {
              userId: activeUser.id,
              feedCommentId: feedComments1.id,
              message: 'Hello Test Reply Message 1',
              images: sampleFeedCommentsObject.images,
            },
          ),
        );

        await feedCommentsService.createFeedReply(
          feedRepliesFactory.build(
            {
              userId: activeUser.id,
              feedCommentId: feedComments2.id,
              message: 'Hello Test Reply Message 2',
              images: sampleFeedCommentsObject.images,
            },
          ),
        );

        await feedCommentsService.createFeedReply(
          feedRepliesFactory.build(
            {
              userId: activeUser.id,
              feedCommentId: feedComments3.id,
              message: 'Hello Test Reply Message 3',
              images: sampleFeedCommentsObject.images,
            },
          ),
        );

        await feedCommentsService.createFeedReply(
          feedRepliesFactory.build(
            {
              userId: activeUser.id,
              feedCommentId: feedComments3.id,
              message: 'Hello Test Reply Message 4',
              images: sampleFeedCommentsObject.images,
            },
          ),
        );
        //this is block user reply
        await feedCommentsService.createFeedReply(
          feedRepliesFactory.build(
            {
              userId: user1.id,
              feedCommentId: feedComments2.id,
              message: 'Hello Test Reply Message 4',
              images: sampleFeedCommentsObject.images,
            },
          ),
        );
        const limit = 3;
        const firstResults = await feedCommentsService.findFeedCommentsWithReplies(
          feedPost.id,
          limit,
          'newestFirst',
          excludedUserIds,
        );
        expect(firstResults).toHaveLength(3);
        const secondResults = await feedCommentsService.findFeedCommentsWithReplies(
          feedPost.id,
          limit,
          'newestFirst',
          excludedUserIds,
          null,
          new mongoose.Types.ObjectId(firstResults[limit - 1]._id.toString()),
        );
        expect(secondResults).toHaveLength(1);
      });
    });
  });

  describe('#findFeedComment', () => {
    it('successfully find single feed comment.', async () => {
      const feedCommentData = await feedCommentsService.createFeedComment(
        feedCommentsFactory.build(
          {
            userId: activeUser.id,
            feedPostId: feedPost.id,
            message: 'Hello Test Message 3',
          },
        ),
      );
      const feedCommentDetails = await feedCommentsService.findFeedComment(feedCommentData._id.toString());
      expect(feedCommentDetails.id).toEqual(feedCommentData._id.toString());
    });

    it('when feed comments id is not exists then expected response', async () => {
      const feedCommentDetails = await feedCommentsService.findFeedComment('6386f95401218469e30dbd25');
      expect(feedCommentDetails).toBeNull();
    });
  });

  describe('#findFeedReply', () => {
    it('successfully find single feed replies.', async () => {
      const feedReplyData = await feedCommentsService.createFeedReply(
        feedRepliesFactory.build(
          {
            userId: activeUser._id,
            feedCommentId: feedComments.id,
            message: sampleFeedCommentsObject.message,
            images: sampleFeedCommentsObject.images,
          },
        ),
      );
      const feedReplyDetails = await feedCommentsService.findFeedReply(feedReplyData._id.toString());
      expect(feedReplyDetails.id).toEqual(feedReplyData._id.toString());
    });

    it('when feed reply id is not exists then expected response', async () => {
      const feedReplyDetails = await feedCommentsService.findFeedReply('6386f95401218469e30dbd25');
      expect(feedReplyDetails).toBeNull();
    });
  });

  describe('#findOneFeedCommentWithReplies', () => {
    let feedPost2;
    let feedComments1;
    let user0;
    let user1;
    let excludedUserIds;
    beforeEach(async () => {
      user0 = await usersService.create(userFactory.build());
      user1 = await usersService.create(userFactory.build());
      await blocksModel.create({
        from: user0._id,
        to: user1._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      excludedUserIds = await blocksService.getUserIdsForBlocksToOrFromUser(user0.id);
      feedPost2 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser.id,
          },
        ),
      );
      feedComments1 = await feedCommentsModel.create({
        feedPostId: feedPost2.id,
        userId: activeUser.id,
        message: sampleFeedCommentsObject.message,
        images: sampleFeedCommentsObject.images,
        likes: [
          '637b39e078b0104f975821bc',
          '637b39e078b0104f975821bd',
          '637b39e078b0104f975821be',
          '637b39e078b0104f97582121',
          activeUser.id,
        ],
      });
      //this is block user comment
      await feedCommentsModel.create({
        feedPostId: feedPost2.id,
        userId: user1.id,
        message: sampleFeedCommentsObject.message,
        images: sampleFeedCommentsObject.images,
        likes: [
          '637b39e078b0104f975821bc',
          '637b39e078b0104f975821bd',
          '637b39e078b0104f975821be',
          '637b39e078b0104f97582121',
          activeUser.id,
        ],
      });
      for (let i = 0; i < 2; i += 1) {
        await feedReplyModel.create({
          feedCommentId: feedComments1._id.toString(),
          userId: activeUser.id,
          message: 'Hello Test Reply Message 1',
          images: sampleFeedCommentsObject.images,
          likes: [
            '63772b35611dc46e8fb42102',
            activeUser.id,
          ],
        });
      }
      //this is block user reply
      await feedReplyModel.create({
        feedCommentId: feedComments1._id.toString(),
        userId: user1.id,
        message: 'Hello Test Reply Message 1',
        images: sampleFeedCommentsObject.images,
        likes: [
          '63772b35611dc46e8fb42102',
          activeUser.id,
        ],
      });
    });

    it('successfully find single feed comments and reply.', async () => {
      const feedCommentAndReplyDetails = await feedCommentsService.findOneFeedCommentWithReplies(
        feedComments1.id,
        true,
        excludedUserIds,
        activeUser.id,
      );
      const getFeedPostData = await feedCommentsModel.findOne(
        {
          $and: [
            { feedPostId: feedPost2._id },
            { userId: { $nin: excludedUserIds } },
          ],
        },
      );
      const getFeedReplyData = await feedReplyModel.find(
        {
          $and: [
            {
              feedCommentId: feedComments1._id.toString(),
            },
            { userId: { $nin: excludedUserIds } },
          ],
        },
      );
      const userData = await usersService.findById(activeUser.id, true);
      const feedCommentAndReply = JSON.parse(JSON.stringify(getFeedPostData));
      const replyData = JSON.parse(JSON.stringify(getFeedReplyData));
      const filterReply = replyData.map((replyId) => {
        // eslint-disable-next-line no-param-reassign
        replyId.likedByUser = replyId.likes.includes(activeUser.id);
        // eslint-disable-next-line no-param-reassign
        replyId.userId = { _id: userData._id.toString(), profilePic: userData.profilePic, userName: userData.userName };
        return replyId;
      });
      feedCommentAndReply.likedByUser = feedCommentAndReply.likes.includes(activeUser.id);
      feedCommentAndReply.userId = { _id: userData._id.toString(), profilePic: userData.profilePic, userName: userData.userName };
      feedCommentAndReply.replies = filterReply;
      expect(feedCommentAndReplyDetails).toEqual(feedCommentAndReply);
    });

    it('when feed comment id is not exists than expected response.', async () => {
      const feedCommentAndReplyDetails = await feedCommentsService.findOneFeedCommentWithReplies(
        '637b39e078b0104f975821be',
        true,
        excludedUserIds,
      );
      expect(feedCommentAndReplyDetails).toBeNull();
    });
  });
});
