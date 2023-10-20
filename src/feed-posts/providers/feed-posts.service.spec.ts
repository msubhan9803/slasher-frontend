/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import mongoose, { Connection, Model } from 'mongoose';
import { DateTime } from 'luxon';
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
import {
  FeedPostDeletionState, FeedPostPrivacyType, FeedPostStatus, PostType,
} from '../../schemas/feedPost/feedPost.enums';
import { RssFeedProvider } from '../../schemas/rssFeedProvider/rssFeedProvider.schema';
import { FriendsService } from '../../friends/providers/friends.service';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { RssFeedService } from '../../rss-feed/providers/rss-feed.service';
import { rssFeedFactory } from '../../../test/factories/rss-feed.factory';
import { FeedLikesService } from '../../feed-likes/providers/feed-likes.service';
import { BlockAndUnblockReaction } from '../../schemas/blockAndUnblock/blockAndUnblock.enums';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../schemas/blockAndUnblock/blockAndUnblock.schema';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { MoviesService } from '../../movies/providers/movies.service';
import { moviesFactory } from '../../../test/factories/movies.factory';
import { MovieActiveStatus } from '../../schemas/movie/movie.enums';
import { RssFeed } from '../../schemas/rssFeed/rssFeed.schema';
import { Movie } from '../../schemas/movie/movie.schema';
import { Image } from '../../schemas/shared/image.schema';
import { HashtagFollowsService } from '../../hashtag-follows/providers/hashtag-follows.service';
import { Hashtag, HashtagDocument } from '../../schemas/hastag/hashtag.schema';
import { ProfileVisibility } from '../../schemas/user/user.enums';
import { BooksService } from '../../books/providers/books.service';
import { booksFactory } from '../../../test/factories/books.factory';

describe('FeedPostsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let feedPostsService: FeedPostsService;
  let feedLikesService: FeedLikesService;
  let feedPostModel: Model<FeedPostDocument>;
  let usersService: UsersService;
  let rssFeedProviderFollowsService: RssFeedProviderFollowsService;
  let rssFeedProvidersService: RssFeedProvidersService;
  let friendsService: FriendsService;
  let activeUser: UserDocument;
  let rssFeedProvider: RssFeedProvider;
  let rssFeedService: RssFeedService;
  let user0: UserDocument;
  let blocksModel: Model<BlockAndUnblockDocument>;
  let moviesService: MoviesService;
  let booksService: BooksService;
  let hashtagFollowsService: HashtagFollowsService;
  let hashtagModel: Model<HashtagDocument>;

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
    rssFeedService = moduleRef.get<RssFeedService>(RssFeedService);
    feedLikesService = moduleRef.get<FeedLikesService>(FeedLikesService);
    booksService = moduleRef.get<BooksService>(BooksService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    hashtagFollowsService = moduleRef.get<HashtagFollowsService>(HashtagFollowsService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    hashtagModel = moduleRef.get<Model<HashtagDocument>>(getModelToken(Hashtag.name));

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
  let rssFeed;
  let movie;
  let book;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
    activeUser = await usersService.create(userFactory.build());
    rssFeedProvider = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
    rssFeed = await rssFeedService.create(rssFeedFactory.build({
      rssfeedProviderId: rssFeedProvider._id,
      content: '<p>this is rss <b>feed</b> <span>test<span> </p>',
    }));
    user0 = await usersService.create(userFactory.build({ userName: 'Hannibal' }));
    movie = await moviesService.create(
      moviesFactory.build(
        {
          status: MovieActiveStatus.Active,
          releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          logo: 'https://picsum.photos/id/237/200/300',
        },
      ),
    );
    book = await booksService.create(booksFactory.build({
      logo: 'https://picsum.photos/id/237/200/300',
      publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
    }));
  });

  it('should be defined', () => {
    expect(feedPostsService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a feed post that is associated with a user', async () => {
      const feedPostData = feedPostFactory.build({
        userId: activeUser.id,
      });
      const feedPost = await feedPostsService.create(feedPostData);
      const reloadedFeedPost = await feedPostsService.findById(feedPost.id, false);
      expect((reloadedFeedPost.userId as unknown as User).toString()).toEqual(activeUser.id);
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

    it('sets the post privacyType value to public by default', async () => {
      const feedPostData = feedPostFactory.build({
        userId: activeUser.id,
      });
      const feedPost = await feedPostsService.create(feedPostData);
      const reloadedFeedPost = await feedPostsService.findById(feedPost.id, false);
      expect(reloadedFeedPost.privacyType).toEqual(FeedPostPrivacyType.Public);
    });
  });

  describe('#findById', () => {
    let feedPost: FeedPostDocument;
    beforeEach(async () => {
      feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser.id,
            rssFeedId: rssFeed.id,
            likes: [activeUser._id, user0._id],
          },
        ),
      );
    });
    it('finds the expected feedPost', async () => {
      const feedPostDetails = await feedPostsService.findById(feedPost.id, false);
      expect(feedPostDetails._id).toEqual(feedPost._id);
    });

    it('finds the expected feed post details that has not deleted and active status', async () => {
      const feedPostData = await feedPostsService.create(
        feedPostFactory.build({
          status: FeedPostStatus.Active,
          userId: activeUser.id,
        }),
      );
      const feedPostDetails = await feedPostsService.findById(feedPostData.id, true);
      expect(feedPostDetails.message).toEqual(feedPostData.message);
    });
  });

  describe('#findByIdWithPopulatedFields', () => {
    let feedPost: FeedPostDocument;
    beforeEach(async () => {
      feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser.id,
            rssFeedId: rssFeed.id,
            likes: [activeUser._id, user0._id],
          },
        ),
      );
    });
    it('finds the expected feed post details', async () => {
      const feedPostDetails = await feedPostsService.findByIdWithPopulatedFields(feedPost.id, false);
      expect((feedPostDetails.rssFeedId as any).content).toBe('<p>this is rss <b>feed</b> <span>test<span> </p>');
      expect(feedPostDetails.message).toEqual(feedPost.message);
      expect(feedPostDetails.likeCount).toBe(2);
    });

    it('finds the expected feed post details that has not deleted and active status', async () => {
      const feedPostData = await feedPostsService.create(
        feedPostFactory.build({
          status: FeedPostStatus.Active,
          userId: activeUser.id,
        }),
      );
      const feedPostDetails = await feedPostsService.findById(feedPostData.id, true);
      expect(feedPostDetails.message).toEqual(feedPostData.message);
    });

    it("populates the profile_status field on the post's returned userId object", async () => {
      const feedPostDetails = await feedPostsService.findByIdWithPopulatedFields(feedPost.id, false);
      expect((feedPostDetails.userId as unknown as User).profile_status).toEqual(activeUser.profile_status);
    });

    it('when add identifylikesforuser than expected response', async () => {
      const feedPostDetails = await feedPostsService.findByIdWithPopulatedFields(feedPost.id, false, activeUser.id);
      expect((feedPostDetails as any).likedByUser).toBe(true);
    });

    it("populates the title field on the post's returned rssFeedId object", async () => {
      const feedPostDetails = await feedPostsService.findByIdWithPopulatedFields(feedPost.id, false);
      expect((feedPostDetails.rssFeedId as unknown as RssFeed).title).toEqual(rssFeed.title);
    });

    it("populates the `logo`, `name` and `releaseDate` field on the post's returned `movieid` field", async () => {
      const feedPostNew = await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser.id,
          movieId: movie._id,
          postType: PostType.MovieReview,
          likes: [activeUser._id, user0._id],
        }),
      );
      const feedPostDetails = await feedPostsService.findByIdWithPopulatedFields(feedPostNew.id, false);
      expect((feedPostDetails.movieId as unknown as Movie).name).toEqual(movie.name);
      expect((feedPostDetails.movieId as unknown as Movie).releaseDate).toEqual(movie.releaseDate);
      expect((feedPostDetails.movieId as unknown as Movie).logo).toEqual(movie.logo);
    });
  });

  describe('#updateMessageInFeedposts', () => {
    it('updates the username in message key and returns the expected response', async () => {
      const feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser.id,
            rssFeedId: rssFeed.id,
            likes: [activeUser._id, user0._id],
            message: `test #ok check #not ##LINK_ID##${activeUser.id}@slasher1##LINK_END##  #hehe #hashtag`,
            is_deleted: 0,
          },
        ),
      );
      const feedPost1 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser.id,
            rssFeedId: rssFeed.id,
            likes: [activeUser._id, user0._id],
            message: `test #ok check #not ##LINK_ID##${activeUser.id}@devid##LINK_END##  #natural #hashtag`,
            is_deleted: 0,
          },
        ),
      );
      await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: user0.id,
            rssFeedId: rssFeed.id,
            likes: [activeUser._id, user0._id],
            message: `test #ok check #not ##LINK_ID##${user0.id}@horror##LINK_END##  #nature #hashtag`,
            is_deleted: 0,
          },
        ),
      );

      await feedPostsService.updateMessageInFeedposts(activeUser.id, 'john');
      expect(
        ((await feedPostsService.findById(feedPost.id, true))).message,
      ).toBe(`test #ok check #not ##LINK_ID##${activeUser.id}@john##LINK_END##  #hehe #hashtag`);
      expect(
        ((await feedPostsService.findById(feedPost1.id, true))).message,
      ).toBe(`test #ok check #not ##LINK_ID##${activeUser.id}@john##LINK_END##  #natural #hashtag`);
    });
  });

  describe('#findAllByUser', () => {
    beforeEach(async () => {
      for (let i = 0; i < 10; i += 1) {
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser.id,
            likes: [activeUser._id, user0._id],
          }),
        );
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser.id,
            is_deleted: FeedPostDeletionState.Deleted,
            status: FeedPostStatus.Inactive,
          }),
        );
      }
    });

    it('when earlier than post id is exist and active only is true then it returns the expected response', async () => {
      const feedPostDetails = feedPostFactory.build({
        userId: activeUser.id,
        status: FeedPostStatus.Active,
        is_deleted: FeedPostDeletionState.NotDeleted,
      });
      const feedPost = await feedPostsService.create(feedPostDetails);
      const feedPostData = await feedPostsService.findAllByUser((activeUser.id).toString(), 20, true, user0.id);
      for (let i = 1; i < feedPostData.length; i += 1) {
        expect(feedPostData[i].createdAt < feedPostData[i - 1].createdAt).toBe(true);
        expect(feedPostData[i].likeCount).toBe(2);
        expect((feedPostData[i] as any).likedByUser).toBe(true);
      }
      expect(feedPostData).toHaveLength(11);
      expect(feedPostData).not.toContain(feedPost.createdAt);
    });

    it('when earlier than post id is does not exist and active only is false then it returns the expected response', async () => {
      const feedPost = await feedPostsService.findAllByUser((activeUser.id).toString(), 20, false, user0.id);
      for (let i = 1; i < feedPost.length; i += 1) {
        expect(feedPost[i].createdAt < feedPost[i - 1].createdAt).toBe(true);
      }
      expect(feedPost).toHaveLength(20);
    });

    it('when earlier than post id is does not exist but active only is true then it returns the expected response', async () => {
      const feedPost = await feedPostsService.findAllByUser((activeUser.id).toString(), 20, true, user0.id);
      for (let i = 1; i < feedPost.length; i += 1) {
        expect(feedPost[i].createdAt < feedPost[i - 1].createdAt).toBe(true);
      }
      expect(feedPost).toHaveLength(10);
    });

    it('when earlier than post id does exist but active only is false then it returns the expected response', async () => {
      const feedPostDetails = feedPostFactory.build({
        userId: activeUser.id,
      });
      const feedPost = await feedPostsService.create(feedPostDetails);
      const feedPostData = await feedPostsService.findAllByUser((activeUser.id).toString(), 20, false, feedPost.id);
      for (let i = 1; i < feedPostData.length; i += 1) {
        expect(feedPostData[i].createdAt < feedPostData[i - 1].createdAt).toBe(true);
      }
      expect(feedPostData).toHaveLength(20);
    });
    it('returns the first and second sets of paginated results', async () => {
      const limit = 6;
      const firstResults = await feedPostsService.findAllByUser(activeUser.id, limit, true, user0.id);
      const secondResults = await feedPostsService.findAllByUser(
        activeUser.id,
        limit,
        true,
        user0.id,
        new mongoose.Types.ObjectId(firstResults[limit - 1]._id.toString()),
      );
      expect(firstResults).toHaveLength(6);
      expect(secondResults).toHaveLength(4);
    });
  });

  describe('#findPostsByMovieId', () => {
    beforeEach(async () => {
      for (let i = 0; i < 10; i += 1) {
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser.id,
            movieId: movie._id,
            postType: PostType.MovieReview,
            likes: [activeUser._id, user0._id],
          }),
        );
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser.id,
            movieId: movie._id,
            postType: PostType.MovieReview,
            is_deleted: FeedPostDeletionState.Deleted,
            status: FeedPostStatus.Inactive,
          }),
        );
      }
    });

    it('when earlier than post id is exist and active only is true then it returns the expected response', async () => {
      const feedPostDetails = feedPostFactory.build({
        userId: activeUser.id,
        movieId: movie.id,
        postType: PostType.MovieReview,
        status: FeedPostStatus.Active,
        is_deleted: FeedPostDeletionState.NotDeleted,
      });
      const feedPost = await feedPostsService.create(feedPostDetails);
      const feedPostData = await feedPostsService.findPostsByMovieId(movie.id, 20, true, feedPost.id);
      for (let i = 1; i < feedPostData.length; i += 1) {
        expect(feedPostData[i].createdAt < feedPostData[i - 1].createdAt).toBe(true);
        expect(feedPostData[i].likeCount).toBe(2);
      }
      expect(feedPostData).toHaveLength(10);
      expect(feedPostData).not.toContain(feedPost.createdAt);
    });

    it('when earlier than post id is does not exist and active only is false then it returns the expected response', async () => {
      const feedPost = await feedPostsService.findPostsByMovieId(movie.id, 20, false);
      for (let i = 1; i < feedPost.length; i += 1) {
        expect(feedPost[i].createdAt < feedPost[i - 1].createdAt).toBe(true);
      }
      expect(feedPost).toHaveLength(20);
    });

    it('when earlier than post id is does not exist but active only is true then it returns the expected response', async () => {
      const feedPost = await feedPostsService.findPostsByMovieId(movie.id, 20, true);
      for (let i = 1; i < feedPost.length; i += 1) {
        expect(feedPost[i].createdAt < feedPost[i - 1].createdAt).toBe(true);
      }
      expect(feedPost).toHaveLength(10);
    });

    it('when earlier than post id does exist but active only is false then it returns the expected response', async () => {
      const feedPostDetails = feedPostFactory.build({
        userId: activeUser.id,
        movieId: movie.id,
        postType: PostType.MovieReview,
      });
      const feedPost = await feedPostsService.create(feedPostDetails);
      const feedPostData = await feedPostsService.findPostsByMovieId(movie.id, 20, false, feedPost.id);
      for (let i = 1; i < feedPostData.length; i += 1) {
        expect(feedPostData[i].createdAt < feedPostData[i - 1].createdAt).toBe(true);
      }
      expect(feedPostData).toHaveLength(20);
    });

    it('returns the first and second sets of paginated results', async () => {
      const limit = 6;
      const firstResults = await feedPostsService.findPostsByMovieId(movie.id, limit, true);
      const secondResults = await feedPostsService.findPostsByMovieId(
        movie.id,
        limit,
        true,
        new mongoose.Types.ObjectId(firstResults[limit - 1]._id.toString()),
      );
      expect(firstResults).toHaveLength(6);
      expect(secondResults).toHaveLength(4);
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
        const limit = 10;
        const requestingContextUserId = activeUser.id;
        const likeUsers = await feedPostsService.findPostsByMovieId(movie.id, limit, true, null, requestingContextUserId);
        const allLikeUsers = likeUsers.map((user) => user._id.toString());
        expect(allLikeUsers).not.toContain(user0.id);
      });
    });
  });

  describe('#findPostsByBookId', () => {
    beforeEach(async () => {
      for (let i = 0; i < 10; i += 1) {
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser.id,
            bookId: book._id,
            postType: PostType.BookReview,
            likes: [activeUser._id, user0._id],
          }),
        );
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser.id,
            bookId: book._id,
            postType: PostType.BookReview,
            is_deleted: FeedPostDeletionState.Deleted,
            status: FeedPostStatus.Inactive,
          }),
        );
      }
    });

    it('when earlier than post id is exist and active only is true then it returns the expected response', async () => {
      const feedPostDetails = feedPostFactory.build({
        userId: activeUser.id,
        bookId: book.id,
        postType: PostType.BookReview,
        status: FeedPostStatus.Active,
        is_deleted: FeedPostDeletionState.NotDeleted,
      });
      const feedPost = await feedPostsService.create(feedPostDetails);
      const feedPostData = await feedPostsService.findPostsByBookId(book.id, 20, true, feedPost.id);
      for (let i = 1; i < feedPostData.length; i += 1) {
        expect(feedPostData[i].createdAt < feedPostData[i - 1].createdAt).toBe(true);
        expect(feedPostData[i].likeCount).toBe(2);
      }
      expect(feedPostData).toHaveLength(10);
      expect(feedPostData).not.toContain(feedPost.createdAt);
    });

    it('when earlier than post id is does not exist and active only is false then it returns the expected response', async () => {
      const feedPost = await feedPostsService.findPostsByBookId(book.id, 20, false);
      for (let i = 1; i < feedPost.length; i += 1) {
        expect(feedPost[i].createdAt < feedPost[i - 1].createdAt).toBe(true);
      }
      expect(feedPost).toHaveLength(20);
    });

    it('when earlier than post id is does not exist but active only is true then it returns the expected response', async () => {
      const feedPost = await feedPostsService.findPostsByBookId(book.id, 20, true);
      for (let i = 1; i < feedPost.length; i += 1) {
        expect(feedPost[i].createdAt < feedPost[i - 1].createdAt).toBe(true);
      }
      expect(feedPost).toHaveLength(10);
    });

    it('when earlier than post id does exist but active only is false then it returns the expected response', async () => {
      const feedPostDetails = feedPostFactory.build({
        userId: activeUser.id,
        bookId: book.id,
        postType: PostType.BookReview,
      });
      const feedPost = await feedPostsService.create(feedPostDetails);
      const feedPostData = await feedPostsService.findPostsByBookId(book.id, 20, false, feedPost.id);
      for (let i = 1; i < feedPostData.length; i += 1) {
        expect(feedPostData[i].createdAt < feedPostData[i - 1].createdAt).toBe(true);
      }
      expect(feedPostData).toHaveLength(20);
    });

    it('returns the first and second sets of paginated results', async () => {
      const limit = 6;
      const firstResults = await feedPostsService.findPostsByBookId(book.id, limit, true);
      const secondResults = await feedPostsService.findPostsByBookId(
        book.id,
        limit,
        true,
        new mongoose.Types.ObjectId(firstResults[limit - 1]._id.toString()),
      );
      expect(firstResults).toHaveLength(6);
      expect(secondResults).toHaveLength(4);
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
        const limit = 10;
        const requestingContextUserId = activeUser.id;
        const likeUsers = await feedPostsService.findPostsByMovieId(movie.id, limit, true, null, requestingContextUserId);
        const allLikeUsers = likeUsers.map((user) => user._id.toString());
        expect(allLikeUsers).not.toContain(user0.id);
      });
    });
  });

  describe('#update', () => {
    let feedPost;
    beforeEach(async () => {
      feedPost = await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser.id,
        }),
      );
    });
    it('finds the expected feed post and update the details, and also updates the lastUpdateAt time', async () => {
      const postBeforeUpdate = await feedPostsService.findById(feedPost.id, false);
      const feedPostData = {
        message: 'Test message',
        images: [
          {
            image_path: '/feed/feed_sample1.jpg',
            description: 'this feed post description 1',
          },
          {
            image_path: '/feed/feed_sample2.jpg',
            description: 'this feed post description 2',
          },
        ],
      };
      const updatedPost = await feedPostsService.update(feedPost.id, feedPostData);
      const reloadedPost = await feedPostsService.findById(updatedPost.id, false);
      expect(reloadedPost.message).toEqual(feedPostData.message);
      expect(reloadedPost.images.map((el) => el.image_path)).toEqual(feedPostData.images.map((el) => el.image_path));
      expect(reloadedPost.lastUpdateAt > postBeforeUpdate.lastUpdateAt).toBeTruthy();
    });
  });

  describe('#findMainFeedPostsForUser', () => {
    describe('successful responses', () => {
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
                  userId: user.id,
                }),
              ),
              // Inactive post
              await feedPostsService.create(
                feedPostFactory.build({
                  userId: user.id,
                  status: FeedPostStatus.Inactive,
                }),
              ),
              // Deleted post
              await feedPostsService.create(
                feedPostFactory.build({
                  userId: user.id,
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
          { userId: activeUser.id, rssfeedProviderId: rssFeedProviderToFollow1.id },
        );
        await rssFeedProviderFollowsService.create(
          { userId: activeUser.id, rssfeedProviderId: rssFeedProviderToFollow2.id },
        );

        // Create some posts by all of the rss feed providers (follow ones and non-follow one)
        for (const rssFeedProv of [rssFeedProviderToFollow1, rssFeedProviderToFollow2, rssFeedProviderDoNotFollow]) {
          for (let i = 0; i < 2; i += 1) {
            await Promise.all([
              // Active post
              await feedPostsService.create(
                feedPostFactory.build({
                  rssfeedProviderId: rssFeedProv.id,
                  userId: rssFeedProv.id,
                }),
              ),
              // Inactive post
              await feedPostsService.create(
                feedPostFactory.build({
                  rssfeedProviderId: rssFeedProv.id,
                  userId: rssFeedProv.id,
                  status: FeedPostStatus.Inactive,
                }),
              ),
              // Deleted post
              await feedPostsService.create(
                feedPostFactory.build({
                  rssfeedProviderId: rssFeedProv.id,
                  userId: rssFeedProv.id,
                  is_deleted: FeedPostDeletionState.Deleted,
                }),
              ),
            ]);
          }
        }
      });

      it('finds the expected set of feed posts for user, ordered in the correct order', async () => {
        const feedPosts = await feedPostsService.findMainFeedPostsForUser(activeUser.id, 100);

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
        const firstResults = await feedPostsService.findMainFeedPostsForUser(activeUser.id, limit);
        for (let index = 1; index < firstResults.length; index += 1) {
          expect(firstResults[index].lastUpdateAt < firstResults[index - 1].lastUpdateAt).toBe(true);
        }
        expect(firstResults).toHaveLength(6);
        // eslint-disable-next-line max-len
        const secondResults = await feedPostsService.findMainFeedPostsForUser(
          activeUser.id,
          limit,
          new mongoose.Types.ObjectId(firstResults[limit - 1]._id.toString()),
        );
        for (let index = 1; index < secondResults.length; index += 1) {
          expect(secondResults[index].lastUpdateAt < secondResults[index - 1].lastUpdateAt).toBe(true);
        }
        expect(secondResults).toHaveLength(4);
      });

      it('returns the expected likeCount', async () => {
        const userData = await usersService.create(userFactory.build());
        await feedPostsService.create(
          feedPostFactory.build({
            userId: userData.id,
            likes: [userData._id],
          }),
        );
        const feedPosts = await feedPostsService.findMainFeedPostsForUser(userData.id, 10);
        expect(feedPosts[0].likeCount).toBe(1);
      });

      it('returns the expected likedByUser', async () => {
        const userData = await usersService.create(userFactory.build());
        await feedPostsService.create(
          feedPostFactory.build({
            userId: userData.id,
            likes: [userData._id],
          }),
        );
        const feedPosts = await feedPostsService.findMainFeedPostsForUser(userData.id, 10);
        expect((feedPosts[0] as any).likedByUser).toBe(true);
      });

      it('when post user profile_status is private than expected response', async () => {
        const user = await usersService.create(userFactory.build({
          profile_status: ProfileVisibility.Private,
        }));
        const hashtag1 = await hashtagModel.create({
          name: 'good',
        });
        const hashtag2 = await hashtagModel.create({
          name: 'goodidea',
        });
        await hashtagFollowsService.create({
          userId: activeUser._id,
          hashTagId: hashtag1._id,
        });
        await hashtagFollowsService.create({
          userId: activeUser._id,
          hashTagId: hashtag2._id,
        });
        const post = await feedPostsService.create(
          feedPostFactory.build({
            userId: user.id,
            message: 'newPost #good #goodidea',
          }),
        );
        const feedPosts = await feedPostsService.findMainFeedPostsForUser(activeUser.id, 100);
        expect(feedPosts).toHaveLength(10);
        for (let i = 1; i < feedPosts.length; i += 1) {
          expect(feedPosts[i]._id).not.toEqual(post._id);
        }
      });

      it('return the expected post when both user are friends', async () => {
        const user1 = await usersService.create(userFactory.build());
        const user2 = await usersService.create(userFactory.build());
        await friendsService.createFriendRequest(user1.id, user2.id);
        await friendsService.acceptFriendRequest(user1.id, user2.id);
        const limit = 6;
        await feedPostsService.create(
          feedPostFactory.build({
            userId: user1.id,
          }),
        );
        await feedPostsService.create(
          feedPostFactory.build({
            userId: user1.id,
          }),
        );
        await feedPostsService.create(
          feedPostFactory.build({
            userId: user2.id,
          }),
        );
        await feedPostsService.create(
          feedPostFactory.build({
            userId: user2.id,
          }),
        );
        const response = await feedPostsService.findMainFeedPostsForUser(user1.id, limit);
        expect(response).toHaveLength(4);
      });

      //public profile of user2
      it(`returns the expected response when both users are not friends and user follows
       the hashtag which is in hashtags of other users post`, async () => {
        const user1 = await usersService.create(userFactory.build());
        const user2 = await usersService.create(userFactory.build());
        const limit = 6;
        const feedPost1 = await feedPostsService.create(
          feedPostFactory.build({
            userId: user1.id,
          }),
        );
        const feedPost2 = await feedPostsService.create(
          feedPostFactory.build({
            userId: user2.id,
            hashtags: ['horror', 'dark'],
          }),
        );
        await feedPostsService.create(
          feedPostFactory.build({
            userId: user2.id,
            hashtags: ['test', 'nature'],
          }),
        );
        const feedPost4 = await feedPostsService.create(
          feedPostFactory.build({
            userId: user2.id,
            hashtags: ['dark', 'nature'],
          }),
        );
        const hashtag1 = await hashtagModel.create({
          name: 'dark',
        });
        await hashtagFollowsService.create({
          userId: user1._id,
          hashTagId: hashtag1._id,
        });
        const response = await feedPostsService.findMainFeedPostsForUser(user1.id, limit);
        expect(response).toHaveLength(3);
        expect(response.map(({ _id }) => _id).sort()).toEqual([feedPost1.id, feedPost2.id, feedPost4.id].sort());
      });

      //private profile of user2
      it(`returns the expected response when both users are not friends and
       user follows the hashtag which is in hashtags of other users privte post`, async () => {
        const user1 = await usersService.create(userFactory.build());
        const user2 = await usersService.create(userFactory.build(
          { profile_status: ProfileVisibility.Private },
        ));
        const limit = 6;
        const feedPost1 = await feedPostsService.create(
          feedPostFactory.build({
            userId: user1.id,
          }),
        );
        const feedPost2 = await feedPostsService.create(
          feedPostFactory.build({
            userId: user1.id,
          }),
        );
        await feedPostsService.create(
          feedPostFactory.build({
            userId: user2.id,
            hashtags: ['test', 'good'],
          }),
        );
        await feedPostsService.create(
          feedPostFactory.build({
            userId: user2.id,
            hashtags: ['horror', 'dark'],
          }),
        );
        const hashtag1 = await hashtagModel.create({
          name: 'dark',
        });
        await hashtagFollowsService.create({
          userId: user1._id,
          hashTagId: hashtag1._id,
        });
        const response = await feedPostsService.findMainFeedPostsForUser(user1.id, limit);
        expect(response).toHaveLength(2);
        expect(response.map(({ _id }) => _id).sort()).toEqual([feedPost1.id, feedPost2.id].sort());
      });
    });

    describe('should not include posts hidden for current user', () => {
      let feedPost1: FeedPostDocument;
      let feedPost2: FeedPostDocument;
      beforeEach(async () => {
        const userFriend1 = await usersService.create(userFactory.build());
        await friendsService.createFriendRequest(activeUser.id, userFriend1.id);
        await friendsService.acceptFriendRequest(activeUser.id, userFriend1.id);
        // Created post is associated with the `userFriend1`
        feedPost1 = await feedPostsService.create(feedPostFactory.build({ userId: userFriend1.id }));
        feedPost2 = await feedPostsService.create(feedPostFactory.build({ userId: userFriend1.id }));
        // feedPost = await feedPostsService.findById(feedPost1.id, false);
      });
      it('does not include a hidden post in the returned results', async () => {
        const limit = 6;
        // Before hiding, verify that post is returend in the `activeUser` feed
        const beforeResults = await feedPostsService.findMainFeedPostsForUser(activeUser.id, limit);
        expect(beforeResults).toHaveLength(2);
        expect(beforeResults[0]._id).toBe(feedPost2.id);
        expect(beforeResults[1]._id).toBe(feedPost1.id);

        // Hide feedPost1 for `activeUser`
        await feedPostsService.hidePost(feedPost1.id, activeUser.id);
        // Verify that user is added to `hideUsers` field of the `feedPost` (refetching updated `feedPost`)
        const reloadedFeedPost1 = await feedPostsService.findById(feedPost1.id, false);
        expect(reloadedFeedPost1.hideUsers).toEqual([activeUser._id]);

        // Verify that the post is not returned after hiding, but that other posts still are
        const afterResults = await feedPostsService.findMainFeedPostsForUser(activeUser.id, limit);
        expect(afterResults).toHaveLength(1);
      });
    });
  });

  describe('#findAllPostsWithImagesByUser', () => {
    beforeEach(async () => {
      for (let i = 0; i < 10; i += 1) {
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser.id,
          }),
        );

        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser.id,
            images: [],
          }),
        );
      }
    });

    it('when earlier than post id is exist then it returns the expected response', async () => {
      const feedPostDetails = feedPostFactory.build({
        userId: activeUser.id,
        status: FeedPostStatus.Active,
        is_deleted: FeedPostDeletionState.NotDeleted,
      });
      const feedPost = await feedPostsService.create(feedPostDetails);
      const feedPostData = await feedPostsService.findAllPostsWithImagesByUser((activeUser.id).toString(), 20, feedPost.id);
      for (let i = 1; i < feedPostData.length; i += 1) {
        expect(feedPostData[i].createdAt < feedPostData[i - 1].createdAt).toBe(true);
      }
      expect(feedPostData).toHaveLength(10);
      expect(feedPostData).not.toContain(feedPost.createdAt);
    });

    it('when earlier than post id is does not exist then it returns the expected response', async () => {
      const feedPost = await feedPostsService.findAllPostsWithImagesByUser((activeUser.id).toString(), 10);
      for (let i = 1; i < feedPost.length; i += 1) {
        expect(feedPost[i].createdAt < feedPost[i - 1].createdAt).toBe(true);
      }
      expect(feedPost).toHaveLength(10);
    });

    it('returns the first and second sets of paginated results', async () => {
      const limit = 6;
      const firstResults = await feedPostsService.findAllPostsWithImagesByUser((activeUser.id).toString(), limit);
      const secondResults = await feedPostsService
        .findAllPostsWithImagesByUser(
          (activeUser.id).toString(),
          limit,
          new mongoose.Types.ObjectId(firstResults[limit - 1]._id.toString()),
        );
      expect(firstResults).toHaveLength(6);
      expect(secondResults).toHaveLength(4);
    });
  });

  describe('#getAllPostsImagesCountByUser', () => {
    const sampleFeedPostImages: Image[] = [
      {
        image_path: '/feed/feed_sample1.jpg',
        description: 'this is image description',
      },
      {
        image_path: '/feed/feed_sample2.jpg',
        description: 'this is image description',
      },
    ];
    beforeEach(async () => {
      // Create 5 posts with 2 images each
      for (let i = 0; i < 5; i += 1) {
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser.id,
            images: sampleFeedPostImages,
          }),
        );
      }
      // Note: Images of delete post should not be included in the returned count by `getAllPostsImagesCountByUser`
      const deletedPostImage: Image = {
        image_path: '/feed/feed_sample3.jpg',
        description: 'this is image description',
      };
      await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser.id,
          images: [deletedPostImage],
          is_deleted: FeedPostDeletionState.Deleted,
        }),
      );
    });
    it('when earlier than post id is exist then it returns the expected response', async () => {
      const allPostsImagesCount = await feedPostsService.getAllPostsImagesCountByUser((activeUser.id).toString());
      expect(allPostsImagesCount).toBe(10);
    });
  });

  describe('#getFeedPostsCountByUser', () => {
    beforeEach(async () => {
      // Create 5 posts
      for (let i = 0; i < 5; i += 1) {
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser.id,
            images: [],
          }),
        );
      }
      // Note: Images of delete post should not be included in the returned count by `getFeedPostsCountByUser`
      await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser.id,
          images: [],
          is_deleted: FeedPostDeletionState.Deleted,
        }),
      );
    });
    it('when earlier than post id is exist then it returns the expected response', async () => {
      const feedPosts = await feedPostsService.getFeedPostsCountByUser((activeUser.id).toString());
      expect(feedPosts).toBe(5);
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
              rssfeedProviderId: rssFeedProviderToFollow1.id,
              userId: rssFeedProviderToFollow1.id,
              likes: [activeUser._id, user0._id],
            }),
          ),
          // Inactive post
          await feedPostsService.create(
            feedPostFactory.build({
              rssfeedProviderId: rssFeedProviderToFollow1.id,
              userId: rssFeedProviderToFollow1.id,
              status: FeedPostStatus.Inactive,
            }),
          ),
          // Deleted post
          await feedPostsService.create(
            feedPostFactory.build({
              rssfeedProviderId: rssFeedProviderToFollow1.id,
              userId: rssFeedProviderToFollow1.id,
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
        new mongoose.Types.ObjectId(firstResults[limit - 1]._id.toString()),
      );
      for (let index = 1; index < secondResults.length; index += 1) {
        expect(secondResults[index].createdAt < secondResults[index - 1].createdAt).toBe(true);
      }
      expect(secondResults).toHaveLength(4);
    });

    it('returns the expected likeCount', async () => {
      const feedPosts = await feedPostsService.findAllByRssFeedProvider(rssFeedProviderToFollow1.id, 10, true);
      for (let i = 1; i < feedPosts.length; i += 1) {
        expect(feedPosts[i].likeCount).toBe(2);
      }
    });

    it('returns the expected likedByUser', async () => {
      const feedPosts = await feedPostsService.findAllByRssFeedProvider(rssFeedProviderToFollow1.id, 10, true, null, activeUser.id);
      for (let i = 1; i < feedPosts.length; i += 1) {
        expect((feedPosts[i] as any).likedByUser).toBe(true);
      }
    });
  });

  describe('#hidePost', () => {
    let feedPost;
    beforeEach(async () => {
      // Created post is associated with the `activeUser`
      const feedPostData = await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser.id,
        }),
      );
      feedPost = await feedPostsService.findById(feedPostData.id, false);
    });

    it('successfully add user to `hideUsers` field in the feed post', async () => {
      await feedPostsService.hidePost(feedPost._id, user0.id);
      const updatedFeedPost = await feedPostsService.findById(feedPost._id, false);

      expect(updatedFeedPost.hideUsers).toEqual([user0._id]);
    });

    it('should not add user id to `hideUsers` field a second time if id *already* exists in the `hideUsers` array', async () => {
      await feedPostsService.hidePost(feedPost._id, user0.id);
      await feedPostsService.hidePost(feedPost._id, user0.id);

      const updatedFeedPost = await feedPostsService.findById(feedPost._id, false);
      expect(updatedFeedPost.hideUsers).toEqual([user0._id]);
    });
  });

  describe('#getLikeUsersForPost', () => {
    let feedPost: FeedPostDocument;
    let user1;
    let user2;

    beforeEach(async () => {
      feedPost = await feedPostsService.create(
        feedPostFactory.build({ userId: activeUser._id }),
      );
      user1 = await usersService.create(userFactory.build({ userName: 'Covey' }));
      user2 = await usersService.create(userFactory.build({ userName: 'Harry' }));

      await friendsService.createFriendRequest(activeUser.id, user0.id);
      await friendsService.acceptFriendRequest(activeUser.id, user0.id);

      await feedLikesService.createFeedPostLike(feedPost.id, activeUser.id);
      await feedLikesService.createFeedPostLike(feedPost.id, user0.id);
      await feedLikesService.createFeedPostLike(feedPost.id, user1.id);
      await feedLikesService.createFeedPostLike(feedPost.id, user2.id);
    });

    it('successfully return list of like users', async () => {
      const limit = 2;
      const offset = 0;
      const likeUsers1 = await feedPostsService.getLikeUsersForPost(feedPost, limit, offset);
      expect(likeUsers1.map((user) => user._id.toString())).toEqual(expect.arrayContaining([activeUser.id, user0.id]));

      // Pagination
      const newOffset = offset + limit;
      const likeUsers2 = await feedPostsService.getLikeUsersForPost(feedPost, limit, newOffset);
      expect(likeUsers2.map((user) => user._id.toString())).toEqual(expect.arrayContaining([user1.id, user2.id]));
    });

    it('successfully return list of like users along with friendStatus', async () => {
      const limit = 2;
      const offset = 0;
      const requestingContextUserId = user0.id;
      const likeUsers = await feedPostsService.getLikeUsersForPost(feedPost, limit, offset, requestingContextUserId);
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
        const likeUsers = await feedPostsService.getLikeUsersForPost(feedPost.id, limit, offset, requestingContextUserId);
        const allLikeUsers = likeUsers.map((user) => user._id.toString());
        expect(allLikeUsers).not.toContain(user0.id);
      });
    });
  });

  describe('#findAllFeedPostsForHashtag', () => {
    let user1;
    let user2;
    let user3;
    let user4;
    let user5;
    beforeEach(async () => {
      user1 = await usersService.create(userFactory.build());
      user2 = await usersService.create(userFactory.build());
      user3 = await usersService.create(userFactory.build());
      user4 = await usersService.create(userFactory.build());
      user5 = await usersService.create(userFactory.build());
      await feedPostsService.create(
        feedPostFactory.build({
          message: 'user1 post #horror #test',
          userId: user1.id,
          hashtags: ['horror', 'test'],
          privacyType: FeedPostPrivacyType.Public,
        }),
      );
      await feedPostsService.create(
        feedPostFactory.build({
          message: 'user2 post #horror #evil',
          userId: user2.id,
          hashtags: ['horror', 'evil'],
          privacyType: FeedPostPrivacyType.Private,
        }),
      );
      await feedPostsService.create(
        feedPostFactory.build({
          message: 'user3 post test #horror',
          userId: user3.id,
          hashtags: ['horror'],
          privacyType: FeedPostPrivacyType.Public,
        }),
      );
      await feedPostsService.create(
        feedPostFactory.build({
          message: 'user4 post #horror',
          userId: user4.id,
          hashtags: ['horror'],
          privacyType: FeedPostPrivacyType.Public,
        }),
      );
      await feedPostsService.create(
        feedPostFactory.build({
          message: 'user5 post #horror',
          userId: user5.id,
          hashtags: ['horror'],
          privacyType: FeedPostPrivacyType.Public,
        }),
      );
      await hashtagModel.create({
        name: 'horror',
      });
    });

    it('when hashtag is "horror" than expected posts response', async () => {
      const feedPost = await feedPostsService.findAllFeedPostsForHashtag('horror', 5);
      expect((feedPost[1] as any)).toHaveLength(4);
    });

    it('when hashtag is "horror" and limit is exists than expected posts response', async () => {
      const feedPost = await feedPostsService.findAllFeedPostsForHashtag('horror', 2);
      expect((feedPost[1] as any)).toHaveLength(2);
    });

    it('returns the expected response when block status is existing between two users', async () => {
      await blocksModel.create({
        from: activeUser.id,
        to: user1.id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const feedPost = await feedPostsService.findAllFeedPostsForHashtag('horror', 5, null, activeUser.id);
      expect((feedPost[1] as any)).toHaveLength(3);
    });
  });
  describe('#findPostsByDays', () => {
    beforeEach(async () => {
      await feedPostsService.create(
        feedPostFactory.build({
          message: 'post #scariness #horridness',
          userId: activeUser.id,
          hashtags: ['horridness', 'horridness'],
        }),
      );
      await feedPostsService.create(
        feedPostFactory.build({
          message: 'post #heinousness #evil',
          userId: activeUser.id,
          hashtags: ['heinousness', 'evil'],
        }),
      );
      await feedPostsService.create(
        feedPostFactory.build({
          message: 'post #torture',
          userId: activeUser.id,
          hashtags: ['torture'],
        }),
      );
    });

    it('successfully find posts by days', async () => {
      const fourteenDaysAgo = DateTime.now().minus({ days: 14 }).toJSDate();
      const posts = await feedPostsService.findPostsByDays(fourteenDaysAgo);
      expect(posts).toEqual([
        'horridness',
        'horridness',
        'heinousness',
        'evil',
        'torture',
      ]);
    });

    it('when post is not match with exists days', async () => {
      await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser._id,
          message: 'post #scary',
          createdAt: DateTime.fromISO('2022-10-18T00:00:00Z').toJSDate(),
          updatedAt: DateTime.fromISO('2022-10-23T00:00:00Z').toJSDate(),
          lastUpdateAt: DateTime.fromISO('2022-10-19T00:00:00Z').toJSDate(),
          hashtags: ['scary'],
        }),
      );
      const fourteenDaysAgo = DateTime.now().minus({ days: 14 }).toJSDate();
      const posts = await feedPostsService.findPostsByDays(fourteenDaysAgo);
      expect(posts).toEqual([
        'horridness',
        'horridness',
        'heinousness',
        'evil',
        'torture',
      ]);
    });
  });

  describe('#findMovieReviewPost', () => {
    beforeEach(async () => {
      // Created post is associated with the `activeUser`
      const feedPostData = await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser.id,
          movieId: movie.id,
          postType: PostType.MovieReview,
        }),
      );
      await feedPostsService.findById(feedPostData.id, false);
    });

    it('successfully find feed post details', async () => {
      const post = await feedPostsService.findMovieReviewPost(activeUser.id, movie.id);
      expect(post.movieId.toString()).toEqual(movie.id);
      expect(post.userId.toString()).toEqual(activeUser.id);
      expect(post.postType).toEqual(PostType.MovieReview);
    });
  });

  describe('#updateLastUpdateAt', () => {
    let feedPost;
    beforeEach(async () => {
      feedPost = await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser.id,
        }),
      );
    });
    it('finds the expected feed post and update the lastUpdateAt time', async () => {
      const postBeforeUpdate = await feedPostsService.findById(feedPost.id, false);
      const updatedPost = await feedPostsService.updateLastUpdateAt(feedPost.id);
      const reloadedPost = await feedPostsService.findById(updatedPost.id, false);
      expect(reloadedPost.lastUpdateAt > postBeforeUpdate.lastUpdateAt).toBeTruthy();
    });
  });

  describe('#updatePostPrivacyType', () => {
    let user;
    let user1;
    let feedPost1;
    let feedPost2;
    let feedPost3;
    let feedPost4;
    beforeEach(async () => {
      user = await usersService.create(userFactory.build({ profile_status: ProfileVisibility.Private }));
      user1 = await usersService.create(userFactory.build({ profile_status: ProfileVisibility.Public }));
      feedPost1 = await feedPostsService.create(
        feedPostFactory.build({
          userId: user.id,
          privacyType: 2,
        }),
      );
      feedPost2 = await feedPostsService.create(
        feedPostFactory.build({
          userId: user.id,
          privacyType: 2,
        }),
      );
      feedPost3 = await feedPostsService.create(
        feedPostFactory.build({
          userId: user1.id,
          privacyType: 1,
        }),
      );
      feedPost4 = await feedPostsService.create(
        feedPostFactory.build({
          userId: user1.id,
          privacyType: 1,
        }),
      );
    });

    it('updates the privacyPost according to user profile visibility', async () => {
      //update private to public
      await feedPostsService.updatePostPrivacyType(user.id, ProfileVisibility.Public);
      expect((await feedPostsService.findById(feedPost1, true)).privacyType).toEqual(FeedPostPrivacyType.Public);
      expect((await feedPostsService.findById(feedPost2, true)).privacyType).toEqual(FeedPostPrivacyType.Public);

      //update public to private
      await feedPostsService.updatePostPrivacyType(user1.id, ProfileVisibility.Private);
      expect((await feedPostsService.findById(feedPost3, true)).privacyType).toEqual(FeedPostPrivacyType.Private);
      expect((await feedPostsService.findById(feedPost4, true)).privacyType).toEqual(FeedPostPrivacyType.Private);
    });
  });

  describe('#deleteAllPostByUserId', () => {
    beforeEach(async () => {
      await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser.id,
        }),
      );
      await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser.id,
        }),
      );
    });

    it('deletes all posts of given user id', async () => {
      await feedPostsService.deleteAllPostByUserId(activeUser.id);
      expect(await feedPostsService.findMainFeedPostsForUser(activeUser.id, 5)).toHaveLength(0);
    });
  });

  describe('#deleteAllFeedPostLikeByUserId', () => {
    it('delete all feedpost likes of given user id', async () => {
      const user1 = await usersService.create(userFactory.build());
      const user2 = await usersService.create(userFactory.build());
      const feedPost1 = await feedPostsService.create(
        feedPostFactory.build({
          userId: user1.id,
          likes: [user2._id, user1._id],
          likeCount: 2,
        }),
      );

      const feedPost2 = await feedPostsService.create(
        feedPostFactory.build({
          userId: user1.id,
          likes: [user2._id, user1._id],
          likeCount: 2,
        }),
      );

      await feedPostsService.deleteAllFeedPostLikeByUserId(user2.id);
      expect((await feedPostsService.findById(feedPost1.id, true)).likeCount).toBe(1);
      expect((await feedPostsService.findById(feedPost2.id, true)).likeCount).toBe(1);
      expect((await feedPostsService.findById(feedPost1.id, true)).likes).not.toContain(user2.id);
      expect((await feedPostsService.findById(feedPost2.id, true)).likes).not.toContain(user2.id);
    });
  });
});
