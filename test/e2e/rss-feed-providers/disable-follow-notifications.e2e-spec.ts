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
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';

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
        userId: activeUser._id,
        rssfeedProviderId: rssFeedProviderData._id,
        notification: RssFeedProviderFollowNotificationsEnabled.Enabled,
      },
    );
  });

  describe('PATCH /rss-feed-providers/:id/follows/:userId/disable-notifications', () => {
    describe('disable notifications in rss feed providers follows details', () => {
      it('when notification is disable than expected response', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/rss-feed-providers/${rssFeedProviderData._id}/follows/${activeUser._id}/disable-notifications`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.notification).toEqual(RssFeedProviderFollowNotificationsEnabled.NotEnabled);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          deleted: 0,
          notification: 0,
          rssfeedProviderId: rssFeedProviderData._id.toString(),
          status: 1,
          userId: activeUser._id.toString(),
        });
      });

      it('when rss feed provider id is not exists than expected response', async () => {
        const tempRssFeedProviderFollowsObjectId = '6337f478980180f44e64487c';
        const response = await request(app.getHttpServer())
          .patch(`/rss-feed-providers/${tempRssFeedProviderFollowsObjectId}/follows/${activeUser._id}/disable-notifications`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ message: 'News partner not found', statusCode: 404 });
      });

      it('when active userid is not exists than expected response', async () => {
        const tempActiveUserIdObjectId = '6337f478980180f44e64487c';
        const response = await request(app.getHttpServer())
          .patch(`/rss-feed-providers/${rssFeedProviderData._id}/follows/${tempActiveUserIdObjectId}/disable-notifications`)
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
          .patch(`/rss-feed-providers/${rssFeedProviderId}/follows/${activeUser._id}/disable-notifications`)
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
