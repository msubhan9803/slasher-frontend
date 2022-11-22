import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { dropCollections } from '../../helpers/mongo-helpers';
import { RssFeedProvidersService } from '../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { RssFeedProvider } from '../../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { rssFeedProviderFactory } from '../../factories/rss-feed-providers.factory';

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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await dropCollections(connection);
  });

  describe('Single Feed Post Details', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
      rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
    });
    it('returns the expected feed post response', async () => {
      const feedPost = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
            rssfeedProviderId: rssFeedProviderData._id,
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .get(`/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body._id).toEqual(feedPost._id.toString());
      expect(response.body.rssfeedProviderId._id).toEqual(rssFeedProviderData._id.toString());
    });
  });
});
