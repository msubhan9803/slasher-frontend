/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { FeedPostsService } from './feed-posts.service';
import { userFactory } from '../../../test/factories/user.factory';
import { rssFeedProviderFactory } from '../../../test/factories/rss-feed-providers.factory';
import { UsersService } from '../../users/providers/users.service';
import { RssFeedProvidersService } from '../../rss-feed-providers/providers/rss-feed-providers.service';
import { RssFeedProviderFollowsService } from '../../rss-feed-provider-follows/providers/rss-feed-provider-follows.service';
import { feedPostFactory } from '../../../test/factories/feed-post.factory';
import { User, UserDocument } from '../../schemas/user/user.schema';
import { FeedPost, FeedPostDocument } from '../../schemas/feedPost/feedPost.schema';
import { FeedPostDeletionState, FeedPostStatus } from '../../schemas/feedPost/feedPost.enums';
import { RssFeedProvider } from '../../schemas/rssFeedProvider/rssFeedProvider.schema';
import { FriendsService } from '../../friends/providers/friends.service';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';

describe('FeedPostsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let feedPostsService: FeedPostsService;
  let feedPostModel: Model<FeedPostDocument>;
  let usersService: UsersService;
  let rssFeedProviderFollowsService: RssFeedProviderFollowsService;
  let rssFeedProvidersService: RssFeedProvidersService;
  let friendsService: FriendsService;
  let activeUser: UserDocument;
  let rssFeedProvider: RssFeedProvider;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    feedPostModel = moduleRef.get<Model<FeedPostDocument>>(getModelToken(FeedPost.name));
    usersService = moduleRef.get<UsersService>(UsersService);
    rssFeedProviderFollowsService = moduleRef.get<RssFeedProviderFollowsService>(RssFeedProviderFollowsService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);

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
    rssFeedProvider = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
  });

  it('should be defined', () => {
    expect(feedPostsService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a feed post that is associated with a user', async () => {
      const feedPostData = feedPostFactory.build({
        userId: activeUser._id,
      });
      const feedPost = await feedPostsService.create(feedPostData);
      const reloadedFeedPost = await feedPostsService.findById(feedPost._id, false);
      expect((reloadedFeedPost.userId as unknown as User)._id).toEqual(activeUser._id);
    });

    it('successfully creates a feed post that is associated with an rss feed provider, '
      + 'and assigns the rssFeedProviert to userId', async () => {
        // Note: The old API assigns the rss feed provider id to the userId field for feedPosts.
        // This isn't ideal, but we need to maintain it for compatibility.
        // TODO: Once we retire the old API, we can change userId to null or to a more legitimate
        // user value.
        const feedPostData = feedPostFactory.build({
          rssfeedProviderId: rssFeedProvider._id,
          userId: rssFeedProvider._id,
        });
        const feedPost = await feedPostsService.create(feedPostData);
        const reloadedFeedPost = await feedPostModel.findOne(feedPost._id);
        expect(reloadedFeedPost.rssfeedProviderId).toEqual(rssFeedProvider._id);
        expect(reloadedFeedPost.userId).toEqual(rssFeedProvider._id);
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

    it('when earlier than post id is exist and active only is true then it returns the expected response', async () => {
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

    it('when earlier than post id is does not exist and active only is false then it returns the expected response', async () => {
      const feedPost = await feedPostsService.findAllByUser((activeUser._id).toString(), 20, false);
      for (let i = 1; i < feedPost.length; i += 1) {
        expect(feedPost[i].createdAt < feedPost[i - 1].createdAt).toBe(true);
      }
      expect(feedPost).toHaveLength(20);
    });

    it('when earlier than post id is does not exist but active only is true then it returns the expected response', async () => {
      const feedPost = await feedPostsService.findAllByUser((activeUser._id).toString(), 20, true);
      for (let i = 1; i < feedPost.length; i += 1) {
        expect(feedPost[i].createdAt < feedPost[i - 1].createdAt).toBe(true);
      }
      expect(feedPost).toHaveLength(10);
    });

    it('when earlier than post id does exist but active only is false then it returns the expected response', async () => {
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
    it('finds the expected feed post and update the details, and also updates the lastUpdateAt time', async () => {
      const postBeforeUpdate = await feedPostsService.findById(feedPost._id, false);
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
      const updatedPost = await feedPostsService.update(feedPost._id, feedPostData);
      const reloadedPost = await feedPostsService.findById(feedPost._id, false);
      expect(updatedPost.updatedAt).toEqual(reloadedPost.updatedAt);
      expect(reloadedPost.message).toEqual(feedPostData.message);
      expect(reloadedPost.images.map((el) => el.image_path)).toEqual(feedPostData.images.map((el) => el.image_path));
      expect(reloadedPost.lastUpdateAt > postBeforeUpdate.lastUpdateAt).toBeTruthy();
    });
  });

  describe('#findMainFeedPostsForUser', () => {
    let userFriend1;
    let userFriend2;
    let userNonFriend;
    let rssFeedProviderToFollow1;
    let rssFeedProviderToFollow2;
    let rssFeedProviderDoNotFollow;
    beforeEach(async () => {
      // Create some other users
      userFriend1 = await usersService.create(userFactory.build());
      userFriend2 = await usersService.create(userFactory.build());
      userNonFriend = await usersService.create(userFactory.build());

      // Create accepted friend relationships for some of the users
      await friendsService.createFriendRequest(activeUser.id, userFriend1.id);
      await friendsService.acceptFriendRequest(activeUser.id, userFriend1.id);
      await friendsService.createFriendRequest(userFriend2.id, activeUser.id);
      await friendsService.acceptFriendRequest(userFriend2.id, activeUser.id);

      // Create some posts by all of the users (activeUser, activeUser's friends, and non-friend)
      for (const user of [activeUser, userFriend1, userFriend2, userNonFriend]) {
        for (let i = 0; i < 2; i += 1) {
          await Promise.all([
            // Active post
            await feedPostsService.create(
              feedPostFactory.build({
                userId: user._id,
              }),
            ),
            // Inactive post
            await feedPostsService.create(
              feedPostFactory.build({
                userId: user._id,
                status: FeedPostStatus.Inactive,
              }),
            ),
            // Deleted post
            await feedPostsService.create(
              feedPostFactory.build({
                userId: user._id,
                is_deleted: FeedPostDeletionState.Deleted,
              }),
            ),
          ]);
        }
      }

      // Create some rss feed providers
      rssFeedProviderToFollow1 = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
      rssFeedProviderToFollow2 = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
      rssFeedProviderDoNotFollow = await rssFeedProvidersService.create(rssFeedProviderFactory.build());

      // Create follow relationships for some of the rssFeedProviders
      await rssFeedProviderFollowsService.create(
        { userId: activeUser._id, rssfeedProviderId: rssFeedProviderToFollow1._id },
      );
      await rssFeedProviderFollowsService.create(
        { userId: activeUser._id, rssfeedProviderId: rssFeedProviderToFollow2._id },
      );

      // Create some posts by all of the rss feed providers (follow ones and non-follow one)
      for (const rssFeedProv of [rssFeedProviderToFollow1, rssFeedProviderToFollow2, rssFeedProviderDoNotFollow]) {
        for (let i = 0; i < 2; i += 1) {
          await Promise.all([
            // Active post
            await feedPostsService.create(
              feedPostFactory.build({
                rssfeedProviderId: rssFeedProv._id,
                userId: rssFeedProv._id,
              }),
            ),
            // Inactive post
            await feedPostsService.create(
              feedPostFactory.build({
                rssfeedProviderId: rssFeedProv._id,
                userId: rssFeedProv._id,
                status: FeedPostStatus.Inactive,
              }),
            ),
            // Deleted post
            await feedPostsService.create(
              feedPostFactory.build({
                rssfeedProviderId: rssFeedProv._id,
                userId: rssFeedProv._id,
                is_deleted: FeedPostDeletionState.Deleted,
              }),
            ),
          ]);
        }
      }
    });

    it('finds the expected set of feed posts for user, ordered in the correct order', async () => {
      const feedPosts = await feedPostsService.findMainFeedPostsForUser(activeUser._id.toString(), 100);

      // We expect 10 posts total because:
      // - The active user has 2 active posts = (2 posts)
      // - The active user has 2 friends with 2 active posts each = (4 posts)
      // - The active user is following 2 rssFeedProviders, each of those providers
      //   have 2 active posts each = (4 more posts)
      expect(feedPosts).toHaveLength(10);

      // And we expect them to be sorted by updatedAt date
      for (let i = 1; i < feedPosts.length; i += 1) {
        expect(feedPosts[i].lastUpdateAt < feedPosts[i - 1].lastUpdateAt).toBe(true);
      }
    });

    it('returns the first and second sets of paginated results', async () => {
      const limit = 6;
      const firstResults = await feedPostsService.findMainFeedPostsForUser(activeUser._id.toString(), limit);
      for (let index = 1; index < firstResults.length; index += 1) {
        expect(firstResults[index].lastUpdateAt < firstResults[index - 1].lastUpdateAt).toBe(true);
      }
      expect(firstResults).toHaveLength(6);
      const secondResults = await feedPostsService.findMainFeedPostsForUser(activeUser._id.toString(), limit, firstResults[limit - 1]._id);
      for (let index = 1; index < secondResults.length; index += 1) {
        expect(secondResults[index].lastUpdateAt < secondResults[index - 1].lastUpdateAt).toBe(true);
      }
      expect(secondResults).toHaveLength(4);
    });
  });

  describe('#findAllPostsWithImagesByUser', () => {
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
            images: [],
          }),
        );
      }
    });

    it('when earlier than post id is exist then it returns the expected response', async () => {
      const feedPostDetails = feedPostFactory.build({
        userId: activeUser._id,
        status: FeedPostStatus.Active,
        is_deleted: FeedPostDeletionState.NotDeleted,
      });
      const feedPost = await feedPostsService.create(feedPostDetails);
      const feedPostData = await feedPostsService.findAllPostsWithImagesByUser((activeUser._id).toString(), 20, feedPost._id);
      for (let i = 1; i < feedPostData.length; i += 1) {
        expect(feedPostData[i].createdAt < feedPostData[i - 1].createdAt).toBe(true);
      }
      expect(feedPostData).toHaveLength(10);
      expect(feedPostData).not.toContain(feedPost.createdAt);
    });

    it('when earlier than post id is does not exist then it returns the expected response', async () => {
      const feedPost = await feedPostsService.findAllPostsWithImagesByUser((activeUser._id).toString(), 10);
      for (let i = 1; i < feedPost.length; i += 1) {
        expect(feedPost[i].createdAt < feedPost[i - 1].createdAt).toBe(true);
      }
      expect(feedPost).toHaveLength(10);
    });

    it('returns the first and second sets of paginated results', async () => {
      const limit = 6;
      const firstResults = await feedPostsService.findAllPostsWithImagesByUser((activeUser._id).toString(), limit);
      const secondResults = await feedPostsService
        .findAllPostsWithImagesByUser((activeUser._id).toString(), limit, firstResults[limit - 1].id);
      expect(firstResults).toHaveLength(6);
      expect(secondResults).toHaveLength(4);
    });
  });

  describe('#findAllByRssFeedProvider', () => {
    let rssFeedProviderToFollow1;
    beforeEach(async () => {
      // Create rss feed providers
      rssFeedProviderToFollow1 = await rssFeedProvidersService.create(rssFeedProviderFactory.build());

      // Create some posts of the rss feed providers
      for (let i = 0; i < 4; i += 1) {
        await Promise.all([
          // Active post
          await feedPostsService.create(
            feedPostFactory.build({
              rssfeedProviderId: rssFeedProviderToFollow1._id,
              userId: rssFeedProviderToFollow1._id,
            }),
          ),
          // Inactive post
          await feedPostsService.create(
            feedPostFactory.build({
              rssfeedProviderId: rssFeedProviderToFollow1._id,
              userId: rssFeedProviderToFollow1._id,
              status: FeedPostStatus.Inactive,
            }),
          ),
          // Deleted post
          await feedPostsService.create(
            feedPostFactory.build({
              rssfeedProviderId: rssFeedProviderToFollow1._id,
              userId: rssFeedProviderToFollow1._id,
              is_deleted: FeedPostDeletionState.Deleted,
            }),
          ),
        ]);
      }
    });

    it('finds the expected set of feed posts for rss feed provider of any status, ordered in the correct order', async () => {
      const feedPosts = await feedPostsService.findAllByRssFeedProvider(rssFeedProviderToFollow1.id, 50, false);

      // We expect 12 posts total because:
      // - The rssFeedProviderToFollow1 has total 12 posts including
      //   status Active, Inactive and Deleted
      expect(feedPosts).toHaveLength(12);

      // And we expect them to be sorted by createdAt date
      for (let i = 1; i < feedPosts.length; i += 1) {
        expect(feedPosts[i].createdAt < feedPosts[i - 1].createdAt).toBe(true);
      }
    });

    it('finds the expected set of feed posts for rss feed provider only active, ordered in the correct order', async () => {
      const feedPosts = await feedPostsService.findAllByRssFeedProvider(rssFeedProviderToFollow1.id, 10, true);

      // We expect 4 posts total because:
      // - The rssFeedProviderToFollow1 has total 4 posts including
      //   status Active
      expect(feedPosts).toHaveLength(4);

      // And we expect them to be sorted by createdAt date
      for (let i = 1; i < feedPosts.length; i += 1) {
        expect(feedPosts[i].createdAt < feedPosts[i - 1].createdAt).toBe(true);
      }
    });

    it('returns the first and second sets of paginated results', async () => {
      const limit = 8;
      const firstResults = await feedPostsService.findAllByRssFeedProvider(rssFeedProviderToFollow1.id, limit, false);
      for (let index = 1; index < firstResults.length; index += 1) {
        expect(firstResults[index].createdAt < firstResults[index - 1].createdAt).toBe(true);
      }
      expect(firstResults).toHaveLength(8);
      const secondResults = await feedPostsService.findAllByRssFeedProvider(
        rssFeedProviderToFollow1.id,
        limit,
        false,
        firstResults[limit - 1]._id,
      );
      for (let index = 1; index < secondResults.length; index += 1) {
        expect(secondResults[index].createdAt < secondResults[index - 1].createdAt).toBe(true);
      }
      expect(secondResults).toHaveLength(4);
    });
  });
});
