import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { RssFeedProvidersService } from '../../../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { RssFeedProviderDocument } from '../../../../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { rssFeedProviderFactory } from '../../../../factories/rss-feed-providers.factory';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { RssFeedService } from '../../../../../src/rss-feed/providers/rss-feed.service';
import { rssFeedFactory } from '../../../../factories/rss-feed.factory';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';

describe('Feed-Post / Single Feed Post Details (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let rssFeedProvidersService: RssFeedProvidersService;
  let rssFeedProviderData: RssFeedProviderDocument;
  let rssFeedService: RssFeedService;
  let blocksModel: Model<BlockAndUnblockDocument>;

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
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  describe('GET /api/v1/feed-posts/:id', () => {
    let rssFeed;
    let user1;
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      user1 = await usersService.create(userFactory.build());
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
        .get(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual({
        _id: feedPost.id,
        createdAt: '2022-10-17T00:00:00.000Z',
        rssfeedProviderId: {
          _id: rssFeedProviderData.id,
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
          _id: activeUser._id.toString(),
          profile_status: ProfileVisibility.Public,
          userName: 'Username1',
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
        },
        commentCount: 0,
        likeCount: 0,
        sharedList: 0,
        likes: [],
        message: expect.any(String),
      });
    });

    it('when user is block than expected response.', async () => {
      const feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: user1._id,
          },
        ),
      );
      await blocksModel.create({
        from: activeUser._id.toString(),
        to: user1._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Request failed due to user block.',
        statusCode: HttpStatus.FORBIDDEN,
      });
    });

    it('returns the expected response when profile status is not public and requesting user is not a friend of post creator', async () => {
      const user = await usersService.create(userFactory.build({
        profile_status: 1,
      }));
      const feedPost = await feedPostsService.create(
        feedPostFactory.build({
          userId: user._id,
        }),
      );
      const response = await request(app.getHttpServer())
        .get(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual({ statusCode: 403, message: 'You must be friends with this user to perform this action.' });
    });
  });
});
