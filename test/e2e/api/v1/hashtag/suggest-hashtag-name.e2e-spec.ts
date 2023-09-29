import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { Hashtag, HashtagDocument } from '../../../../../src/schemas/hastag/hashtag.schema';
import { HashtagActiveStatus } from '../../../../../src/schemas/hastag/hashtag.enums';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';

describe('Suggested Hashtag Name (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let hashtagModel: Model<HashtagDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    hashtagModel = moduleRef.get<Model<HashtagDocument>>(getModelToken(Hashtag.name));

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

    activeUser = await usersService.create(userFactory.build(
      { userName: 'test-user1' },
    ));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    await hashtagModel.create({
      name: 'good',
    });
    await hashtagModel.create({
      name: 'goodidea',
    });
    await hashtagModel.create({
      name: 'goodbook',
    });
    await hashtagModel.create({
      name: 'goodnight',
    });
    await hashtagModel.create({
      name: 'goodmorning',
      status: HashtagActiveStatus.Deactivated,
      deleted: true,
    });
    await hashtagModel.create({
      name: 'goodbyy',
      status: HashtagActiveStatus.Deactivated,
      deleted: true,
    });
  });

  describe('GET /api/v1/hashtags/suggest', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/hashtags/suggest').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Get all suggest hashtag name', () => {
      it('returns suggestions when there are results that match the query (and even includes the '
        + "requesting hashtags's name when the query matches)", async () => {
          const limit = 20;
          const query = 'goo';
          const response = await request(app.getHttpServer())
            .get(`/api/v1/hashtags/suggest?query=${query}&limit=${limit}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();
          expect(response.body).toEqual([
            { _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX), name: 'good' },
            { _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX), name: 'goodbook' },
            { _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX), name: 'goodidea' },
            { _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX), name: 'goodnight' },
          ]);
        });

      it('when query is wrong than expected response', async () => {
        const limit = 5;
        const query = 'yy';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/hashtags/suggest?query=${query}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([]);
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const query = 'yy';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/hashtags/suggest?query=${query}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/hashtags/suggest?query=yy&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 30', async () => {
        const limit = 31;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/hashtags/suggest?query=yy&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 30');
      });

      it('when query does not exists than expected suggested user name', async () => {
        const limit = 5;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/hashtags/suggest?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('query should not be empty');
      });
    });
  });
});
