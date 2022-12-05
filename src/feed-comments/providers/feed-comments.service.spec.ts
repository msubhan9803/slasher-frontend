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
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    activeUser = await usersService.create(userFactory.build());
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
        activeUser.id,
        sampleFeedCommentsObject.message,
        sampleFeedCommentsObject.images,
      );
    feedReply = await feedCommentsService
      .createFeedReply(
        feedComments.id,
        activeUser.id,
        sampleFeedCommentsObject.message,
        sampleFeedCommentsObject.images,
      );
  });

  it('should be defined', () => {
    expect(feedCommentsService).toBeDefined();
  });

  describe('#createFeedComment', () => {
    it('successfully creates a feed comments.', async () => {
      const feedCommentData = await feedCommentsService
        .createFeedComment(
          feedPost.id,
          activeUser.id,
          sampleFeedCommentsObject.message,
          sampleFeedCommentsObject.images,
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
      expect(feedComments.message).not.toEqual(message1);
    });
  });

  describe('#deleteFeedComment', () => {
    it('finds the expected comments and delete the details', async () => {
      await feedCommentsService.deleteFeedComment(feedComments.id);
      const feedCommentData = await feedCommentsModel.findById(feedComments._id);
      expect(feedComments.is_deleted).not.toEqual(feedCommentData.is_deleted);
      const feedPostsData = await feedPostsService.findById(feedCommentData.feedPostId.toString(), false);
      expect(feedPostsData.commentCount).toBe(0);
    });
  });

  describe('#createFeedReply', () => {
    it('successfully creates a feed replies.', async () => {
      const feedReplyData = await feedCommentsService
        .createFeedReply(
          feedComments.id,
          activeUser.id,
          sampleFeedCommentsObject.message,
          sampleFeedCommentsObject.images,
        );
      expect(feedReplyData.feedCommentId).toEqual(feedComments._id);
    });
  });

  describe('#updateFeedReply', () => {
    it('finds the expected replies and update the details', async () => {
      const message = 'Hello Test Reply Message 2';
      const updatedReply = await feedCommentsService.updateFeedReply(feedReply.id, message);
      const feedReplyData = await feedReplyModel.findById(updatedReply._id);
      expect(feedReplyData.message).toEqual(message);
      expect(feedComments.message).not.toEqual(message);
    });
  });

  describe('#deleteFeedReply', () => {
    it('finds the expected reply and delete the details', async () => {
      await feedCommentsService.deleteFeedReply(feedReply.id);
      const feedReplyData = await feedReplyModel.findById(feedReply._id);
      expect(feedReply.deleted).not.toEqual(feedReplyData.deleted);
    });
  });

  describe('#findFeedCommentsWithReplies', () => {
    it('finds the expected comments and delete the details', async () => {
      const messages = ['Hello Test Reply Message 1', 'Hello Test Reply Message 2', 'Hello Test Reply Message 3'];
      const feedComments1 = await feedCommentsService
        .createFeedComment(
          feedPost.id,
          activeUser._id.toString(),
          sampleFeedCommentsObject.message,
          sampleFeedCommentsObject.images,
        );
      const feedComments2 = await feedCommentsService
        .createFeedComment(
          feedPost.id,
          activeUser._id.toString(),
          sampleFeedCommentsObject.message,
          sampleFeedCommentsObject.images,
        );
      for (let i = 0; i < 3; i += 1) {
        await feedCommentsService
          .createFeedReply(
            feedComments1._id.toString(),
            activeUser._id.toString(),
            messages[i],
            sampleFeedCommentsObject.images,
          );
      }
      await feedCommentsService
        .createFeedReply(
          feedComments2._id.toString(),
          activeUser._id.toString(),
          'Hello Test Reply Message 4',
          sampleFeedCommentsObject.images,
        );
      const feedCommentsWithReplies = await feedCommentsService.findFeedCommentsWithReplies(feedPost.id, 20);
      expect(feedCommentsWithReplies).toHaveLength(3);
    });

    describe('when `before` argument is supplied', () => {
      it('get expected first and second sets of paginated results', async () => {
        const feedComments1 = await feedCommentsService
          .createFeedComment(
            feedPost.id,
            activeUser._id.toString(),
            'Hello Test Message 1',
            sampleFeedCommentsObject.images,
          );
        const feedComments2 = await feedCommentsService
          .createFeedComment(
            feedPost.id,
            activeUser._id.toString(),
            'Hello Test Message 2',
            sampleFeedCommentsObject.images,
          );
        const feedComments3 = await feedCommentsService
          .createFeedComment(
            feedPost.id,
            activeUser._id.toString(),
            'Hello Test Message 3',
            sampleFeedCommentsObject.images,
          );
        await feedCommentsService
          .createFeedReply(
            feedComments1._id.toString(),
            activeUser._id.toString(),
            'Hello Test Reply Message 1',
            sampleFeedCommentsObject.images,
          );
        await feedCommentsService
          .createFeedReply(
            feedComments2._id.toString(),
            activeUser._id.toString(),
            'Hello Test Reply Message 2',
            sampleFeedCommentsObject.images,
          );
        await feedCommentsService
          .createFeedReply(
            feedComments3._id.toString(),
            activeUser._id.toString(),
            'Hello Test Reply Message 3',
            sampleFeedCommentsObject.images,
          );
        await feedCommentsService
          .createFeedReply(
            feedComments3._id.toString(),
            activeUser._id.toString(),
            'Hello Test Reply Message 4',
            sampleFeedCommentsObject.images,
          );
        const limit = 3;
        const firstResults = await feedCommentsService.findFeedCommentsWithReplies(feedPost.id, limit);
        expect(firstResults).toHaveLength(3);
        const secondResults = await feedCommentsService.findFeedCommentsWithReplies(
          feedPost.id,
          limit,
          new mongoose.Types.ObjectId(firstResults[limit - 1]._id.toString()),
        );
        expect(secondResults).toHaveLength(1);
      });
    });
  });

  describe('#findFeedComment', () => {
    it('successfully find single feed comment.', async () => {
      const feedCommentData = await feedCommentsService
        .createFeedComment(
          feedPost.id,
          activeUser.id,
          sampleFeedCommentsObject.message,
          sampleFeedCommentsObject.images,
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
      const feedReplyData = await feedCommentsService
      .createFeedReply(
        feedComments.id,
        activeUser.id,
        sampleFeedCommentsObject.message,
        sampleFeedCommentsObject.images,
      );
      const feedReplyDetails = await feedCommentsService.findFeedReply(feedReplyData._id.toString());
      expect(feedReplyDetails.id).toEqual(feedReplyData._id.toString());
    });

    it('when feed reply id is not exists then expected response', async () => {
      const feedReplyDetails = await feedCommentsService.findFeedReply('6386f95401218469e30dbd25');
      expect(feedReplyDetails).toBeNull();
    });
  });
});
