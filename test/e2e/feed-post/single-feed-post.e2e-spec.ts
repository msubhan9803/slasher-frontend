import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { RssFeedProvidersService } from '../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { RssFeedProvider } from '../../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { rssFeedProviderFactory } from '../../factories/rss-feed-providers.factory';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { RssFeedService } from '../../../src/rss-feed/providers/rss-feed.service';
import { rssFeedFactory } from '../../factories/rss-feed.factory';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';

describe('Feed-Post / Single Feed Post Details (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let rssFeedProvidersService: RssFeedProvidersService;
  let rssFeedProviderData: RssFeedProvider;
  let rssFeedService: RssFeedService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    rssFeedService = moduleRef.get<RssFeedService>(RssFeedService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  describe('Single Feed Post Details', () => {
    let rssFeed;
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
      rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
      rssFeed = await rssFeedService.create(rssFeedFactory.build({
        rssfeedProviderId: rssFeedProviderData._id,
        content: '<p>this is rss <b>feed</b> <span>test<span> </p>',
      }));
    });
    it('returns the expected feed post response', async () => {
      const feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
            rssfeedProviderId: rssFeedProviderData._id,
            rssFeedId: rssFeed._id,
            createdAt: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .get(`/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        createdAt: '2022-10-17T00:00:00.000Z',
        rssfeedProviderId: {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          logo: null,
          title: 'RssFeedProvider 1',
        },
        rssFeedId: {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          content: '<p>this is rss <b>feed</b> <span>test<span> </p>',
        },
        images: [
          {
            image_path: 'http://localhost:4444/local-storage/feed/feed_sample1.jpg',
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          },
          {
            image_path: 'http://localhost:4444/local-storage/feed/feed_sample1.jpg',
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          },
        ],
        userId: {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          userName: 'Username1',
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
        },
        commentCount: 0,
        likeCount: 0,
        sharedList: 0,
        likes: [],
      });
    });
  });
});
