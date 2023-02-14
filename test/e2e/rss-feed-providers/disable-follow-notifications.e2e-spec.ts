import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { RssFeedProvidersService } from '../../../src/rss-feed-providers/providers/rss-feed-providers.service';
import { rssFeedProviderFactory } from '../../factories/rss-feed-providers.factory';
import { RssFeedProvider } from '../../../src/schemas/rssFeedProvider/rssFeedProvider.schema';
import { RssFeedProviderActiveStatus } from '../../../src/schemas/rssFeedProvider/rssFeedProvider.enums';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { RssFeedProviderFollowsService } from '../../../src/rss-feed-provider-follows/providers/rss-feed-provider-follows.service';
import { RssFeedProviderFollowNotificationsEnabled } from '../../../src/schemas/rssFeedProviderFollow/rssFeedProviderFollow.enums';

describe('Disable Follow Notifications (e2e)', () => {
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    activeUser = await usersService.create(userFactory.build());
    rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build({
      status: RssFeedProviderActiveStatus.Active,
    }));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    await rssFeedProviderFollowsService.create(
      {
        userId: activeUser.id,
        rssfeedProviderId: rssFeedProviderData._id,
        notification: RssFeedProviderFollowNotificationsEnabled.Enabled,
      },
    );
  });

  describe('PATCH /rss-feed-providers/:id/follows/:userId/disable-notifications', () => {
    describe('disable notifications in rss feed providers follows details', () => {
      it('returns the expected response when notifications are disabled', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/rss-feed-providers/${rssFeedProviderData._id}/follows/${activeUser.id}/disable-notifications`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.notification).toEqual(RssFeedProviderFollowNotificationsEnabled.NotEnabled);
        expect(response.body).toEqual({ notification: 0 });
      });

      it('returns the expected response when the rss feed provider id is not found', async () => {
        const rssFeedProviderId = '6337f478980180f44e64487c';
        const response = await request(app.getHttpServer())
          .patch(`/rss-feed-providers/${rssFeedProviderId}/follows/${activeUser.id}/disable-notifications`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ message: 'News partner not found', statusCode: 404 });
      });

      it("returns the expected error response when a user tries to update another user's notification status", async () => {
        const differentUserId = '6337f478980180f44e64487c';
        const response = await request(app.getHttpServer())
          .patch(`/rss-feed-providers/${rssFeedProviderData._id}/follows/${differentUserId}/disable-notifications`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
        expect(response.body).toEqual({ message: 'Not authorized', statusCode: 401 });
      });
    });

    describe('Validation', () => {
      it('id must be a mongodb id', async () => {
        const rssFeedProviderId = '634912b22c2f4f5edsamkm2m';
        const response = await request(app.getHttpServer())
          .patch(`/rss-feed-providers/${rssFeedProviderId}/follows/${activeUser.id}/disable-notifications`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({ error: 'Bad Request', message: ['id must be a mongodb id'], statusCode: 400 });
      });

      it('userId must be a mongodb id', async () => {
        const activeUserId = '634912b22c2f4f5edspjki2m';
        const response = await request(app.getHttpServer())
          .patch(`/rss-feed-providers/${rssFeedProviderData._id}/follows/${activeUserId}/disable-notifications`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({ error: 'Bad Request', message: ['userId must be a mongodb id'], statusCode: 400 });
      });
    });
  });
});
