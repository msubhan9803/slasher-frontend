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
import { RssFeedProviderActiveStatus } from '../../../src/schemas/rssFeedProvider/rssFeedProvider.enums';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';

describe('rssFeedProviders all (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let rssFeedProvidersService: RssFeedProvidersService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
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
    for (let index = 0; index < 5; index += 1) {
      await rssFeedProvidersService.create(
        rssFeedProviderFactory.build(),
      );
      await rssFeedProvidersService.create(
        rssFeedProviderFactory.build(
          {
            status: RssFeedProviderActiveStatus.Active,
          },
        ),
      );
    }
  });

  describe('GET /rss-feed-providers', () => {
    describe('Successful get all rss feed providers data', () => {
      it('get all rss feed providers details', async () => {
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/rss-feed-providers?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toHaveLength(3);
        expect(response.body).toEqual([
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            description: null,
            logo: null,
            title: 'RssFeedProvider 10',
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            description: null,
            logo: null,
            title: 'RssFeedProvider 2',
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            description: null,
            logo: null,
            title: 'RssFeedProvider 4',
          },
        ]);
      });

      describe('when `after` argument is supplied', () => {
        it('get expected first and second sets of paginated results', async () => {
          const limit = 3;
          const firstResponse = await request(app.getHttpServer())
            .get(`/rss-feed-providers?limit=${limit}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();

          expect(firstResponse.status).toEqual(HttpStatus.OK);
          expect(firstResponse.body).toHaveLength(3);
          expect(firstResponse.body).toEqual([
            {
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: null,
              logo: null,
              title: 'RssFeedProvider 12',
            },
            {
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: null,
              logo: null,
              title: 'RssFeedProvider 14',
            },
            {
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: null,
              logo: null,
              title: 'RssFeedProvider 16',
            },
          ]);

          const secondResponse = await request(app.getHttpServer())
            .get(`/rss-feed-providers?limit=${limit}&after=${firstResponse.body[2]._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();

          expect(secondResponse.status).toEqual(HttpStatus.OK);
          expect(secondResponse.body).toHaveLength(2);
        });
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get('/rss-feed-providers')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'limit must not be greater than 20',
            'limit must be a number conforming to the specified constraints',
            'limit should not be empty',
          ],
          statusCode: 400,
        });
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/rss-feed-providers?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'limit must not be greater than 20',
            'limit must be a number conforming to the specified constraints',
          ],
          statusCode: 400,
        });
      });

      it('limit should not be grater than 20', async () => {
        const limit = 21;
        const response = await request(app.getHttpServer())
          .get(`/rss-feed-providers?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'limit must not be greater than 20',
          ],
          statusCode: 400,
        });
      });
    });
  });
});
