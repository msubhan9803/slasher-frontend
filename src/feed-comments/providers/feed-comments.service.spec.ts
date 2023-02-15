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

describe('FeedCommentsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let feedCommentsService: FeedCommentsService;
  let feedPostsService: FeedPostsService;
  let usersService: UsersService;
  let activeUser: UserDocument;
  let feedPost: FeedPostDocument;
  let feedCommentsModel: Model<FeedCommentDocument>;
  let feedReplyModel: Model<FeedReplyDocument>;

  const sampleFeedCommentsObject = {
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
    feedCommentsService = moduleRef.get<FeedCommentsService>(FeedCommentsService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    feedCommentsModel = moduleRef.get<Model<FeedCommentDocument>>(getModelToken(FeedComment.name));
    feedReplyModel = moduleRef.get<Model<FeedReplyDocument>>(getModelToken(FeedReply.name));

    app = moduleRef.createNestApplication();
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
      const message1 = 'Hello Test Message 2';
      const updatedComment = await feedCommentsService.updateFeedComment(feedComments._id.toString(), message1);
      const feedCommentData = await feedCommentsModel.findById(updatedComment._id);
      expect(feedCommentData.message).toEqual(message1);
    });
  });

  describe('#deleteFeedComment', () => {
    it('finds the expected comments and delete the details', async () => {
      await feedCommentsService.deleteFeedComment(feedComments.id);
      const feedCommentData = await feedCommentsModel.findById(feedComments._id);
      expect(feedCommentData.is_deleted).toEqual(FeedCommentDeletionState.Deleted);
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
      const message = 'Hello Test Reply Message 2';
      const updatedReply = await feedCommentsService.updateFeedReply(feedReply.id, message);
      const feedReplyData = await feedReplyModel.findById(updatedReply._id);
      expect(feedReplyData.message).toEqual(message);
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
      const feedCommentsWithReplies = await feedCommentsService.findFeedCommentsWithReplies(feedPost.id, 20, 'newestFirst');
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

      const getFeedPostData = await feedCommentsModel.find({ feedPostId: feedPost1._id });
      const getFeedReplyData = await feedReplyModel.find({
        feedCommentId:
          { $in: [feedComments1._id.toString(), feedComments2._id.toString()] },
      });
      const userData = await usersService.findById(activeUser.id);
      const feedCommentsWithReplies = await feedCommentsService.findFeedCommentsWithReplies(
        feedPost1.id,
        20,
        'newestFirst',
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
      feedCommentAndReply.sort((a, b) => -a.createdAt.localeCompare(b.createdAt));
      expect(feedCommentsWithReplies).toHaveLength(2);
      expect(feedCommentsWithReplies).toEqual(feedCommentAndReply);
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

        const limit = 3;
        const firstResults = await feedCommentsService.findFeedCommentsWithReplies(feedPost.id, limit, 'newestFirst');
        expect(firstResults).toHaveLength(3);
        const secondResults = await feedCommentsService.findFeedCommentsWithReplies(
          feedPost.id,
          limit,
          'newestFirst',
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
    beforeEach(async () => {
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
    });

    it('successfully find single feed comments and reply.', async () => {
      const feedCommentAndReplyDetails = await feedCommentsService.findOneFeedCommentWithReplies(feedComments1.id, true, activeUser.id);
      const getFeedPostData = await feedCommentsModel.findOne({ feedPostId: feedPost2._id });
      const getFeedReplyData = await feedReplyModel.find({
        feedCommentId: feedComments1._id.toString(),
      });
      const userData = await usersService.findById(activeUser.id);
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
      const feedCommentAndReplyDetails = await feedCommentsService.findOneFeedCommentWithReplies('637b39e078b0104f975821be', true);
      expect(feedCommentAndReplyDetails).toBeNull();
    });
  });
});
