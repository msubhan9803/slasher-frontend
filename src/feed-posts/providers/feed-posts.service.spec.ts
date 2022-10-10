import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { FeedPostsService } from './feed-posts.service';
import { userFactory } from '../../../test/factories/user.factory';
import { UsersService } from '../../users/providers/users.service';
import { feedPostFactory } from '../../../test/factories/feed-post.factory';
import { User } from '../../schemas/user/user.schema';
import { FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';
import { FeedPostDeletionState, FeedPostStatus } from '../../schemas/feedPost/feedPost.enums';

describe('FeedPostsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let feedPostsService: FeedPostsService;
  let usersService: UsersService;
  let activeUser: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    usersService = moduleRef.get<UsersService>(UsersService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();
    activeUser = await usersService.create(userFactory.build());
  });

  it('should be defined', () => {
    expect(feedPostsService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a feed post', async () => {
      const feedPostData = feedPostFactory.build({
        userId: activeUser._id,
      });
      const feedPost = await feedPostsService.create(feedPostData);
      expect(await feedPostsService.findById(feedPost._id, false)).toBeTruthy();
    });
  });

  describe('#findById', () => {
    let feedPost: FeedPostDocument;
    beforeEach(async () => {
      feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
          },
        ),
      );
    });

    it('finds the expected feed post details', async () => {
      const feedPostDetails = await feedPostsService.findById(feedPost._id, false);
      expect(feedPostDetails.message).toEqual(feedPost.message);
    });

    it('finds the expected feed post details that has not deleted and active status', async () => {
      const feedPostData = await feedPostsService.create(
        feedPostFactory.build({
          status: FeedPostStatus.Active,
          userId: activeUser._id,
        }),
      );
      const feedPostDetails = await feedPostsService.findById(feedPostData._id, true);
      expect(feedPostDetails.message).toEqual(feedPostData.message);
    });
  });

  describe('#findAllByUser', () => {
    beforeEach(async () => {
      for (let i = 0; i < 10; i += 1) {
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser._id,
          }),
        );
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser._id,
            is_deleted: FeedPostDeletionState.Deleted,
            status: FeedPostStatus.Inactive,
          }),
        );
      }
    });

    it('when earlier than post id is exist and active only is true than expected response', async () => {
      const feedPostDetails = feedPostFactory.build({
        userId: activeUser._id,
        status: FeedPostStatus.Active,
        is_deleted: FeedPostDeletionState.NotDeleted,
      });
      const feedPost = await feedPostsService.create(feedPostDetails);
      const feedPostData = await feedPostsService.findAllByUser((activeUser._id).toString(), 20, true, feedPost._id);
      for (let i = 1; i < feedPostData.length; i += 1) {
        expect(feedPostData[i].createdAt < feedPostData[i - 1].createdAt).toBe(true);
      }
      expect(feedPostData).toHaveLength(10);
      expect(feedPostData).not.toContain(feedPost.createdAt);
    });

    it('when earlier than post id is does not exist and active only is false than expected response', async () => {
      const feedPost = await feedPostsService.findAllByUser((activeUser._id).toString(), 20, false);
      for (let i = 1; i < feedPost.length; i += 1) {        
        expect(feedPost[i].createdAt < feedPost[i - 1].createdAt).toBe(true);
      }
      expect(feedPost).toHaveLength(20);
    });

    it('when earlier than post id is does not exist but active only is true than expected response', async () => {
      const feedPost = await feedPostsService.findAllByUser((activeUser._id).toString(), 20, true);
      for (let i = 1; i < feedPost.length; i += 1) {        
        expect(feedPost[i].createdAt < feedPost[i - 1].createdAt).toBe(true);
      }
      expect(feedPost).toHaveLength(10);
    });

    it('when earlier than post id does exist but active only is false than expected response', async () => {
      const feedPostDetails = feedPostFactory.build({
        userId: activeUser._id,
      });
      const feedPost = await feedPostsService.create(feedPostDetails);
      const feedPostData = await feedPostsService.findAllByUser((activeUser._id).toString(), 20, false, feedPost._id);
      for (let i = 1; i < feedPostData.length; i += 1) {        
        expect(feedPostData[i].createdAt < feedPostData[i - 1].createdAt).toBe(true);
      }
      expect(feedPostData).toHaveLength(20);
    });
    it('returns the first and second sets of paginated results', async () => {
      const limit = 6;
      const firstResults = await feedPostsService.findAllByUser((activeUser._id).toString(), limit, true);
      const secondResults = await feedPostsService.findAllByUser((activeUser._id).toString(), limit, true, firstResults[limit - 1].id);
      expect(firstResults).toHaveLength(6);
      expect(secondResults).toHaveLength(4);
    });
  });

  describe('#update', () => {
    let feedPost;
    beforeEach(async () => {
      feedPost = await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser._id,
        }),
      );
    });
    it('finds the expected feed post and update the details', async () => {
      const feedPostData = {
        message: 'Test message',
        images: [
          {
            image_path: 'https://picsum.photos/id/237/200/300',
          },
          {
            image_path: 'https://picsum.photos/seed/picsum/200/300',
          },
        ],
      };
      const updatedFindPost = await feedPostsService.update(feedPost._id, feedPostData);
      const reloadedFindPost = await feedPostsService.findById(updatedFindPost._id, false);
      expect(reloadedFindPost.message).toEqual(updatedFindPost.message);
      expect(reloadedFindPost.images).toEqual(updatedFindPost.images);
    });
  });
});
