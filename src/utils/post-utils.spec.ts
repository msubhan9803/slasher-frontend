/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import mongoose, { Connection } from 'mongoose';
import { feedPostFactory } from '../../test/factories/feed-post.factory';
import { rewindAllFactories } from '../../test/helpers/factory-helpers.ts';
import { clearDatabase } from '../../test/helpers/mongo-helpers';
import { AppModule } from '../app.module';
import { FeedPostsService } from '../feed-posts/providers/feed-posts.service';
import { PostType } from '../schemas/feedPost/feedPost.enums';
import { configureAppPrefixAndVersioning } from './app-setup-utils';
import { getPostType } from './post-utils';

describe('post-utils', () => {
  let app: INestApplication;
  let connection: Connection;
  let feedPostsService: FeedPostsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    connection = moduleRef.get<Connection>(getConnectionToken());
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
  });

  describe('#getPostType', () => {
    it('detects the proper post type', async () => {
      const rssfeedProviderId = new mongoose.Types.ObjectId() as any;
      const newsFeedPostWithNoPostTypeValue = await feedPostsService.create(
        feedPostFactory.build({
          rssfeedProviderId,
          userId: rssfeedProviderId, // rss feed posts always assign rssfeedProviderId to userId for old API compatibility
        }),
      );
      expect(getPostType(newsFeedPostWithNoPostTypeValue)).toEqual(PostType.News);

      const userFeedPostWithNoPostTypeValue = await feedPostsService.create({
        userId: new mongoose.Types.ObjectId() as any,
      });
      expect(getPostType(userFeedPostWithNoPostTypeValue)).toEqual(PostType.User);

      const feedPostWithPostTypeUser = await feedPostsService.create({
        postType: PostType.User,
        userId: new mongoose.Types.ObjectId() as any,
      });
      expect(getPostType(feedPostWithPostTypeUser)).toEqual(PostType.User);

      const feedPostWithPostTypeNews = await feedPostsService.create({
        postType: PostType.News,
        userId: new mongoose.Types.ObjectId() as any,
      });
      expect(getPostType(feedPostWithPostTypeNews)).toEqual(PostType.News);

      const feedPostWithPostTypeMovieReview = await feedPostsService.create({
        postType: PostType.MovieReview,
        userId: new mongoose.Types.ObjectId() as any,
      });
      expect(getPostType(feedPostWithPostTypeMovieReview)).toEqual(PostType.MovieReview);
    });
  });
});
