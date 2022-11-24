import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
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
  let user0: UserDocument;
  let feedPost: FeedPostDocument;
  let feedComments: FeedCommentDocument;
  let feedReply: FeedReplyDocument;
  let feedCommentsModel: Model<FeedCommentDocument>;
  let feedReplyModel: Model<FeedReplyDocument>;

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

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    activeUser = await usersService.create(userFactory.build());
    user0 = await usersService.create(userFactory.build());
    feedPost = await feedPostsService.create(
      feedPostFactory.build(
        {
          userId: activeUser._id,
        },
      ),
    );
    feedComments = await feedCommentsModel.create(
      {
        userId: activeUser._id,
        feedPostId: feedPost._id,
        images: [
          {
            image_path: 'https://picsum.photos/id/237/200/300',
          },
          {
            image_path: 'https://picsum.photos/seed/picsum/200/300',
          },
        ],
        message: 'Hello Test Message 1',
      },
    );
    feedReply = await feedReplyModel.create(
      {
        userId: activeUser._id,
        feedCommentId: feedComments._id,
        images: [
          {
            image_path: 'https://picsum.photos/id/237/200/300',
          },
          {
            image_path: 'https://picsum.photos/seed/picsum/200/300',
          },
        ],
        message: 'Hello Test Message 1',
      },
    );
  });

  it('should be defined', () => {
    expect(feedCommentsService).toBeDefined();
  });

  describe('#createFeedComment', () => {
    it('successfully creates a feed comments.', async () => {
      const images = [
        {
          image_path: 'https://picsum.photos/id/237/200/300',
        },
        {
          image_path: 'https://picsum.photos/seed/picsum/200/300',
        },
      ];
      const message = 'Hello Test Message 1';
      const feedCommentData = await feedCommentsService.createFeedComment(feedPost.id, activeUser.id, message, images);
      expect(feedCommentData.message).toEqual(message);
    });
  });

  describe('#updateFeedComment', () => {
    it('finds the expected comments and update the details', async () => {
      const message = 'Hello Test Message 2';
      const updatedComment = await feedCommentsService.updateFeedComment(feedComments.id, message);
      const feedCommentData = await feedCommentsModel.findById(updatedComment._id);
      expect(feedCommentData.message).toEqual(message);
      expect(feedComments.message).not.toEqual(message);
    });
  });

  describe('#deleteFeedComment', () => {
    it('finds the expected comments and delete the details', async () => {
      await feedCommentsService.deleteFeedComment(feedComments.id);
      const feedCommentData = await feedCommentsModel.findById(feedComments._id);
      expect(feedComments.is_deleted).not.toEqual(feedCommentData.is_deleted);
    });
  });

  describe('#createFeedReply', () => {
    it('successfully creates a feed replies.', async () => {
      const images = [
        {
          image_path: 'https://picsum.photos/id/237/200/300',
        },
        {
          image_path: 'https://picsum.photos/seed/picsum/200/300',
        },
      ];
      const message = 'Hello Test Reply Message 1';
      const feedReplyData = await feedCommentsService.createFeedReply(feedComments.id, activeUser.id, message, images);
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
    it('finds the expected comments and delete the details', async () => {
      await feedCommentsService.deleteFeedReply(feedReply.id);
      const feedReplyData = await feedReplyModel.findById(feedReply._id);
      expect(feedReply.deleted).not.toEqual(feedReplyData.deleted);
    });
  });

  describe('#findFeedCommentsWithReplies', () => {
    let feedComments1: FeedCommentDocument;
    let feedComments2: FeedCommentDocument;
    const message = ['Hello Test Reply Message 1', 'Hello Test Reply Message 2', 'Hello Test Reply Message 3'];
    beforeEach(async () => {
      feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
          },
        ),
      );
      feedComments1 = await feedCommentsModel.create(
        {
          userId: user0._id,
          feedPostId: feedPost._id,
          images: [
            {
              image_path: 'https://picsum.photos/id/237/200/300',
            },
            {
              image_path: 'https://picsum.photos/seed/picsum/200/300',
            },
          ],
          message: 'Hello Test Message 2',
        },
      );
      feedComments2 = await feedCommentsModel.create(
        {
          userId: user0._id,
          feedPostId: feedPost._id,
          images: [
            {
              image_path: 'https://picsum.photos/id/237/200/300',
            },
          ],
          message: 'Hello Test Message 2',
        },
      );
      for (let i = 0; i < 3; i += 1) {
        await feedReplyModel.create(
          {
            userId: user0._id,
            feedCommentId: feedComments1._id,
            images: [
              {
                image_path: 'https://picsum.photos/id/237/200/300',
              },
              {
                image_path: 'https://picsum.photos/seed/picsum/200/300',
              },
            ],
            message: message[i],
          },
        );
      }
      await feedReplyModel.create(
        {
          userId: user0._id,
          feedCommentId: feedComments2._id,
          images: [
            {
              image_path: 'https://picsum.photos/id/237/200/300',
            },
            {
              image_path: 'https://picsum.photos/seed/picsum/200/300',
            },
          ],
          message: 'Hello Test Reply Message 4',
        },
      );
    });
    it('finds the expected comments and delete the details', async () => {
      const feedCommentsWithReplies = await feedCommentsService.findFeedCommentsWithReplies(feedPost.id, 20);
      expect(feedCommentsWithReplies).toHaveLength(2);
    });

    // describe('when `before` argument is supplied', () => {
    //   let feedComments1: FeedCommentDocument;
    //   let feedComments2: FeedCommentDocument;
    //   let feedComments3: FeedCommentDocument;
    //   let feedComments4: FeedCommentDocument;
    //   let feedComments5: FeedCommentDocument;
    //   let message = ["Hello Test Reply Message 1", "Hello Test Reply Message 2", "Hello Test Reply Message 3"]
    //   beforeEach(async () => {
    //     feedPost = await feedPostsService.create(
    //       feedPostFactory.build(
    //         {
    //           userId: activeUser._id,
    //         },
    //       ),
    //     );
    //     feedComments1 = await feedCommentsModel.create(
    //       {
    //         userId: user0._id,
    //         feedPostId: feedPost._id,
    //         images: [
    //           {
    //             image_path: 'https://picsum.photos/id/237/200/300',
    //           },
    //           {
    //             image_path: 'https://picsum.photos/seed/picsum/200/300',
    //           },
    //         ],
    //         message: "Hello Test Message 2"
    //       },
    //     );
    //     feedComments2 = await feedCommentsModel.create(
    //       {
    //         userId: user0._id,
    //         feedPostId: feedPost._id,
    //         images: [
    //           {
    //             image_path: 'https://picsum.photos/id/237/200/300',
    //           },
    //         ],
    //         message: "Hello Test Message 2"
    //       },
    //     );
    //     feedComments3 = await feedCommentsModel.create(
    //       {
    //         userId: user0._id,
    //         feedPostId: feedPost._id,
    //         images: [
    //           {
    //             image_path: 'https://picsum.photos/id/237/200/300',
    //           },
    //           {
    //             image_path: 'https://picsum.photos/seed/picsum/200/300',
    //           },
    //         ],
    //         message: "Hello Test Message 2"
    //       },
    //     );
    //     feedComments4 = await feedCommentsModel.create(
    //       {
    //         userId: user0._id,
    //         feedPostId: feedPost._id,
    //         images: [
    //           {
    //             image_path: 'https://picsum.photos/id/237/200/300',
    //           },
    //           {
    //             image_path: 'https://picsum.photos/seed/picsum/200/300',
    //           },
    //         ],
    //         message: "Hello Test Message 2"
    //       },
    //     );
    //     feedComments5 = await feedCommentsModel.create(
    //       {
    //         userId: user0._id,
    //         feedPostId: feedPost._id,
    //         images: [
    //           {
    //             image_path: 'https://picsum.photos/id/237/200/300',
    //           },
    //           {
    //             image_path: 'https://picsum.photos/seed/picsum/200/300',
    //           },
    //         ],
    //         message: "Hello Test Message 2"
    //       },
    //     );
    //     for (let i = 0; i < 3; i += 1) {
    //       await feedReplyModel.create(
    //         {
    //           userId: user0._id,
    //           feedCommentId: feedComments1._id,
    //           images: [
    //             {
    //               image_path: 'https://picsum.photos/id/237/200/300',
    //             },
    //             {
    //               image_path: 'https://picsum.photos/seed/picsum/200/300',
    //             },
    //           ],
    //           message: message[i]
    //         },
    //       );
    //     }
    //     await feedReplyModel.create(
    //       {
    //         userId: user0._id,
    //         feedCommentId: feedComments2._id,
    //         images: [
    //           {
    //             image_path: 'https://picsum.photos/id/237/200/300',
    //           },
    //           {
    //             image_path: 'https://picsum.photos/seed/picsum/200/300',
    //           },
    //         ],
    //         message: "Hello Test Reply Message 4"
    //       },
    //     );
    //     await feedReplyModel.create(
    //       {
    //         userId: user0._id,
    //         feedCommentId: feedComments3._id,
    //         images: [
    //           {
    //             image_path: 'https://picsum.photos/id/237/200/300',
    //           },
    //           {
    //             image_path: 'https://picsum.photos/seed/picsum/200/300',
    //           },
    //         ],
    //         message: "Hello Test Reply Message 5"
    //       },
    //     );
    //     await feedReplyModel.create(
    //       {
    //         userId: user0._id,
    //         feedCommentId: feedComments4._id,
    //         images: [
    //           {
    //             image_path: 'https://picsum.photos/id/237/200/300',
    //           },
    //           {
    //             image_path: 'https://picsum.photos/seed/picsum/200/300',
    //           },
    //         ],
    //         message: "Hello Test Reply Message 6"
    //       },
    //     );
    //     await feedReplyModel.create(
    //       {
    //         userId: user0._id,
    //         feedCommentId: feedComments5._id,
    //         images: [
    //           {
    //             image_path: 'https://picsum.photos/id/237/200/300',
    //           },
    //           {
    //             image_path: 'https://picsum.photos/seed/picsum/200/300',
    //           },
    //         ],
    //         message: "Hello Test Reply Message 7"
    //       },
    //     );
    //   });
    //   it('get expected first and second sets of paginated results', async () => {
    //     const limit = 3;
    //     const firstResults = await feedCommentsService.findFeedCommentsWithReplies(feedPost.id, limit);
    //     expect(firstResults).toHaveLength(3);
    //     const secondResults = await feedCommentsService.findFeedCommentsWithReplies(feedPost.id, limit);
    //     expect(secondResults).toHaveLength(2);
    //   });

    // });
  });
});
