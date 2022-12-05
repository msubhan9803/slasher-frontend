import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../factories/feed-post.factory';
import { rssFeedProviderFactory } from '../../factories/rss-feed-providers.factory';
import { RssFeedProvider } from '../../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { RssFeedProvidersService } from '../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { RssFeedProviderActiveStatus } from '../../../src/schemas/rssFeedProvider/rssFeedProvider.enums';

describe('rssFeedProviders /:id/posts (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let rssFeedProviderData: RssFeedProvider;
  let nonActiveRssFeedProviderData: RssFeedProvider;
  let rssFeedProvidersService: RssFeedProvidersService;

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
    await clearDatabase(connection);
    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build({
      status: RssFeedProviderActiveStatus.Active,
    }));

    nonActiveRssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build());

    await feedPostsService.create(
      feedPostFactory.build({
        userId: activeUser._id,
        rssfeedProviderId: rssFeedProviderData._id,
      }),
    );
  });

  describe('Find Feed Posts For rss feed provider', () => {
    it('returns the expected feed post response', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/rss-feed-providers/${rssFeedProviderData._id}/posts?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      for (let i = 1; i < response.body.length; i += 1) {
        expect(response.body[i].createdAt < response.body[i - 1].createdAt).toBe(true);
      }
    });

    it('returns the expected response when rss feed provider not found', async () => {
      const limit = 5;
      const response = await request(app.getHttpServer())
        .get(`/rss-feed-providers/${nonActiveRssFeedProviderData._id}/posts?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.NOT_FOUND);
      expect(response.body.message).toContain('RssFeedProvider not found');
    });

    describe('when `before` argument is supplied', () => {
      beforeEach(async () => {
        for (let index = 0; index < 3; index += 1) {
          await feedPostsService.create(
            feedPostFactory.build({
              userId: activeUser._id,
              rssfeedProviderId: rssFeedProviderData._id,
            }),
          );
        }
      });
      it('get expected first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResponse = await request(app.getHttpServer())
          .get(`/rss-feed-providers/${rssFeedProviderData._id}/posts?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        for (let index = 1; index < firstResponse.body.length; index += 1) {
          expect(firstResponse.body[index].createdAt < firstResponse.body[index - 1].createdAt).toBe(true);
        }
        expect(firstResponse.body).toHaveLength(3);

        const secondResponse = await request(app.getHttpServer())
          .get(`/rss-feed-providers/${rssFeedProviderData._id}/posts?limit=${limit}&before=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        for (let index = 1; index < secondResponse.body.length; index += 1) {
          expect(secondResponse.body[index].createdAt < secondResponse.body[index - 1].createdAt).toBe(true);
        }
        expect(secondResponse.body).toHaveLength(1);
      });
    });

    describe('Validation', () => {
      it('id must match regular expression', async () => {
        const limit = 3;
        const rssFeedProviderId = '634912b22c2f4f5edsamkm2m';
        const response = await request(app.getHttpServer())
          .get(`/rss-feed-providers/${rssFeedProviderId}/posts?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain(
          'id must be a mongodb id',
        );
      });
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/rss-feed-providers/${rssFeedProviderData._id}/posts`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/rss-feed-providers/${rssFeedProviderData._id}/posts?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 30', async () => {
        const limit = 31;
        const response = await request(app.getHttpServer())
          .get(`/rss-feed-providers/${rssFeedProviderData._id}/posts?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 30');
      });

      it('`before` must match regular expression', async () => {
        const limit = 3;
        const before = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .get(`/rss-feed-providers/${rssFeedProviderData._id}/posts?limit=${limit}&before=${before}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain(
          'before must be a mongodb id',
        );
      });
    });
  });
});
