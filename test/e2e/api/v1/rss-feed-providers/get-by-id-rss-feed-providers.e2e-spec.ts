import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { RssFeedProvidersService } from '../../../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { rssFeedProviderFactory } from '../../../../factories/rss-feed-providers.factory';
import { RssFeedProvider } from '../../../../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { RssFeedProviderActiveStatus } from '../../../../../src/schemas/rssFeedProvider/rssFeedProvider.enums';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('rssFeedProviders / :id (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let rssFeedProvidersService: RssFeedProvidersService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let activeRssFeedProvider: RssFeedProvider;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
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

    activeUser = await usersService.create(userFactory.build());
    activeRssFeedProvider = await rssFeedProvidersService.create(rssFeedProviderFactory.build({
      status: RssFeedProviderActiveStatus.Active,
      feed_url: 'https://gruesomemagazine.com/feed',
    }));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('GET /api/v1/rss-feed-providers/:id', () => {
    it('requires authentication', async () => {
      const rssFeedProviderId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).get(
        `/api/v1/rss-feed-providers/${rssFeedProviderId}`,
      ).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Successful get rss feed providers data', () => {
      it('get the rss feed providers successful if parameter id value is exists', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/rss-feed-providers/${activeRssFeedProvider._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          description: null,
          logo: null,
          title: 'RssFeedProvider 1',
          feed_url: 'https://gruesomemagazine.com/feed',
        });
      });

      it('rss feed providers not found if parameter id value does not exists', async () => {
        const tempRssFeedProviderObjectId = '6337f478980180f44e64487c';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/rss-feed-providers/${tempRssFeedProviderObjectId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ message: 'RssFeedProvider not found', statusCode: 404 });
      });
    });

    describe('Validation', () => {
      it('id must be a mongodb id', async () => {
        const rssReedProviderId = 'not-a-mongo-id';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/rss-feed-providers/${rssReedProviderId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'id must be a mongodb id',
        );
      });
    });
  });
});
