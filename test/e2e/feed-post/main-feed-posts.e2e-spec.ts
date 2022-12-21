import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { rssFeedProviderFactory } from '../../factories/rss-feed-providers.factory';
import { Friend, FriendDocument } from '../../../src/schemas/friend/friend.schema';
import { FriendRequestReaction } from '../../../src/schemas/friend/friend.enums';
import { RssFeedProvider } from '../../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { RssFeedProvidersService } from '../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { RssFeedProviderFollowsService } from '../../../src/rss-feed-provider-follows/providers/rss-feed-provider-follows.service';
import { clearDatabase } from '../../helpers/mongo-helpers';

describe('Feed-Post / Main Feed Posts (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let user1: User;
  let user2: User;
  let rssFeedProviderData: RssFeedProvider;
  let rssFeedProviderData2: RssFeedProvider;
  let friendsModel: Model<FriendDocument>;
  let rssFeedProviderFollowsService: RssFeedProviderFollowsService;
  let rssFeedProvidersService: RssFeedProvidersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    rssFeedProviderFollowsService = moduleRef.get<RssFeedProviderFollowsService>(RssFeedProviderFollowsService);
    friendsModel = moduleRef.get<Model<FriendDocument>>(getModelToken(Friend.name));

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
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    user1 = await usersService.create(userFactory.build());
    user2 = await usersService.create(userFactory.build());
    rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
    rssFeedProviderData2 = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
    await friendsModel.create({
      from: activeUser._id.toString(),
      to: user1._id.toString(),
      reaction: FriendRequestReaction.Accepted,
    });
    await friendsModel.create({
      from: user2._id.toString(),
      to: activeUser._id.toString(),
      reaction: FriendRequestReaction.Accepted,
    });
    await rssFeedProviderFollowsService.create(
      {
        userId: activeUser._id,
        rssfeedProviderId: rssFeedProviderData._id,
      },
    );
    await rssFeedProviderFollowsService.create(
      {
        userId: activeUser._id,
        rssfeedProviderId: rssFeedProviderData2._id,
      },
    );
    await feedPostsService.create(
      feedPostFactory.build({
        userId: activeUser._id,
        rssfeedProviderId: rssFeedProviderData._id,
      }),
    );
    await feedPostsService.create(
      feedPostFactory.build({
        userId: user1._id,
        rssfeedProviderId: rssFeedProviderData2._id,
      }),
    );
  });

  describe('Find Main Feed Posts For User', () => {
    it('returns the expected feed post response', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/feed-posts?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      for (let i = 1; i < response.body.length; i += 1) {
        expect(response.body[i].lastUpdateAt < response.body[i - 1].lastUpdateAt).toBe(true);
      }
    });

    describe('when `before` argument is supplied', () => {
      beforeEach(async () => {
        for (let index = 0; index < 3; index += 1) {
          await feedPostsService.create(
            feedPostFactory.build({
              userId: user1._id,
              rssfeedProviderId: rssFeedProviderData2._id,
            }),
          );
        }
      });
      it('get expected first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResponse = await request(app.getHttpServer())
          .get(`/feed-posts?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        for (let index = 1; index < firstResponse.body.length; index += 1) {
          expect(firstResponse.body[index].lastUpdateAt < firstResponse.body[index - 1].lastUpdateAt).toBe(true);
        }
        expect(firstResponse.body).toHaveLength(3);

        const secondResponse = await request(app.getHttpServer())
          .get(`/feed-posts?limit=${limit}&before=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        for (let index = 1; index < secondResponse.body.length; index += 1) {
          expect(secondResponse.body[index].lastUpdateAt < secondResponse.body[index - 1].lastUpdateAt).toBe(true);
        }
        expect(secondResponse.body).toHaveLength(2);
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get('/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/feed-posts?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 30', async () => {
        const limit = 31;
        const response = await request(app.getHttpServer())
          .get(`/feed-posts?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 30');
      });

      it('`before` must match regular expression', async () => {
        const limit = 3;
        const before = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .get(`/feed-posts?limit=${limit}&before=${before}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain(
          'before must be a mongodb id',
        );
      });
    });
  });
});
