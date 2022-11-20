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
import { dropCollections } from '../../helpers/mongo-helpers';

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
    await dropCollections(connection);

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
        const limit = 10;
        const response = await request(app.getHttpServer())
          .get(`/rss-feed-providers?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();

        for (let index = 1; index < response.body.length; index += 1) {
          expect(response.body[index - 1].sortTitle < response.body[index].sortTitle).toBe(true);
        }
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toHaveLength(5);
      });

      describe('when `after` argument is supplied', () => {
        it('get expected first and second sets of paginated results', async () => {
          const limit = 3;
          const firstResponse = await request(app.getHttpServer())
            .get(`/rss-feed-providers?limit=${limit}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();

          for (let index = 1; index < firstResponse.body.length; index += 1) {
            expect(firstResponse.body[index - 1].sortTitle < firstResponse.body[index].sortTitle).toBe(true);
          }
          expect(firstResponse.status).toEqual(HttpStatus.OK);
          expect(firstResponse.body).toHaveLength(3);

          const secondResponse = await request(app.getHttpServer())
            .get(`/rss-feed-providers?limit=${limit}&after=${firstResponse.body[2]._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();

          for (let index = 1; index < secondResponse.body.length; index += 1) {
            expect(secondResponse.body[index - 1].sortTitle < secondResponse.body[index].sortTitle).toBe(true);
          }
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
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/rss-feed-providers?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 20', async () => {
        const limit = 21;
        const response = await request(app.getHttpServer())
          .get(`/rss-feed-providers?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 20');
      });
    });
  });
});
