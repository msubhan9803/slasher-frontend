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
import { RssFeedProviderFollowsService } from '../../../../../src/rss-feed-provider-follows/providers/rss-feed-provider-follows.service';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { RssFeedProviderFollowNotificationsEnabled } from '../../../../../src/schemas/rssFeedProviderFollow/rssFeedProviderFollow.enums';

describe('Create Follow (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let rssFeedProvidersService: RssFeedProvidersService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let rssFeedProviderData: RssFeedProvider;
  let configService: ConfigService;
  let rssFeedProviderFollowsService: RssFeedProviderFollowsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);
    rssFeedProviderFollowsService = moduleRef.get<RssFeedProviderFollowsService>(RssFeedProviderFollowsService);
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
    rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build({
      status: RssFeedProviderActiveStatus.Active,
    }));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('POST /api/v1/rss-feed-providers/:id/follows/:userId', () => {
    it('requires authentication', async () => {
      const rssFeedProviderId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).post(
        `/api/v1/rss-feed-providers/${rssFeedProviderId}/follows/${userId}`,
      ).expect(HttpStatus.UNAUTHORIZED);
    });

    it('successfully create the rss feed providers follow record', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/rss-feed-providers/${rssFeedProviderData._id}/follows/${activeUser._id.toString()}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      const follow = await rssFeedProviderFollowsService
        .findByUserAndRssFeedProvider(
          activeUser._id.toString(),
          rssFeedProviderData._id.toString(),
        );
      expect(follow.userId.toString()).toBe(activeUser._id.toString());
      expect(follow.rssfeedProviderId.toString()).toBe(rssFeedProviderData._id.toString());
      expect(response.body).toEqual({ notification: RssFeedProviderFollowNotificationsEnabled.Enabled });
    });

    it('returns the expected response when the rss feed provider id is not found', async () => {
      const rssFeedProviderId = '6337f478980180f44e64487c';
      const response = await request(app.getHttpServer())
        .post(`/api/v1/rss-feed-providers/${rssFeedProviderId}/follows/${activeUser._id.toString()}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({
        message: 'News partner not found',
        statusCode: 404,
      });
    });

    it("returns the expected error response when a user tries to update another user's follow status", async () => {
      const differentUserId = '6337f478980180f44e64487c';
      const response = await request(app.getHttpServer())
        .post(`/api/v1/rss-feed-providers/${rssFeedProviderData._id}/follows/${differentUserId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
      expect(response.body).toEqual({
        message: 'Not authorized',
        statusCode: 401,
      });
    });

    describe('Validation', () => {
      it('id must be a mongodb id', async () => {
        const rssFeedProviderId = '634912b22c2f4f5edsamkm2m';
        const response = await request(app.getHttpServer())
          .post(`/api/v1/rss-feed-providers/${rssFeedProviderId}/follows/${activeUser._id.toString()}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'id must be a mongodb id',
          ],
          statusCode: 400,
        });
      });

      it('userId must be a mongodb id', async () => {
        const userId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .post(`/api/v1/rss-feed-providers/${rssFeedProviderData._id}/follows/${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'userId must be a mongodb id',
          ],
          statusCode: 400,
        });
      });
    });
  });
});
