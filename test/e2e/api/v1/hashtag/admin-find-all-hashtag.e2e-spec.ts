import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User, UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { Hashtag, HashtagDocument } from '../../../../../src/schemas/hastag/hashtag.schema';
import { HashtagsSortByType } from '../../../../../src/types';
import { UserType } from '../../../../../src/schemas/user/user.enums';

describe('Admin find all hashtags (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let user1AuthToken: string;
  let configService: ConfigService;
  let hashtagModel: Model<HashtagDocument>;
  let userModel: Model<UserDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    hashtagModel = moduleRef.get<Model<HashtagDocument>>(getModelToken(Hashtag.name));
    userModel = moduleRef.get<Model<UserDocument>>(getModelToken(User.name));

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
      { userName: 'admin-test-user' },
    ));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    // Update user to admin
    await userModel.findOneAndUpdate({ _id: activeUser._id }, { userType: UserType.Admin });

    user1 = await usersService.create(userFactory.build(
      { userName: 'regular-test-user' },
    ));
    user1AuthToken = user1.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    for (let index = 1; index <= 10; index += 1) {
      await hashtagModel.create({ name: `hashtag${index}` });
    }
  });

  describe('GET /api/v1/hashtags/admin/find-all', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/hashtags/admin/find-all').expect(HttpStatus.UNAUTHORIZED);
    });

    it('only admins have access to this API', async () => {
      const page = 1;
      const perPage = 3;
      const sortBy: HashtagsSortByType = 'name';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/hashtags/admin/find-all?page=${page}&perPage=${perPage}&sortBy=${sortBy}`)
        .auth(user1AuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual({ message: 'Only admins can access this API', statusCode: 404 });
    });

    describe('Get all suggest hashtag name', () => {
      it('return all hashtags with respective details', async () => {
        const page = 1;
        const perPage = 3;
        const sortBy: HashtagsSortByType = 'name';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/hashtags/admin/find-all?page=${page}&perPage=${perPage}&sortBy=${sortBy}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          allItemsCount: 10,
          items: [
            {
              _id: expect.any(String),
              name: 'hashtag1',
              status: 1,
              createdAt: expect.any(String),
            },
            {
              _id: expect.any(String),
              name: 'hashtag10',
              status: 1,
              createdAt: expect.any(String),
            },
            {
              _id: expect.any(String),
              name: 'hashtag2',
              status: 1,
              createdAt: expect.any(String),
            },
          ],
          page: 1,
          perPage: 3,
        });
      });

      it('return hashtag search results with respective details', async () => {
        const page = 1;
        const perPage = 3;
        const sortBy: HashtagsSortByType = 'name';
        const nameContains = 'hashtag1';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/hashtags/admin/find-all?page=${page}&perPage=${perPage}&sortBy=${sortBy}&nameContains=${nameContains}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          allItemsCount: 2,
          items: [
            {
              _id: expect.any(String),
              name: 'hashtag1',
              status: 1,
              createdAt: expect.any(String),
            },
            {
              _id: expect.any(String),
              name: 'hashtag10',
              status: 1,
              createdAt: expect.any(String),
            },
          ],
          page: 1,
          perPage: 3,
        });
      });
    });

    describe('Validation', () => {
      it('perPage should not be empty', async () => {
        const page = 1;
        const sortBy: HashtagsSortByType = 'name';
        const nameContains = 'hashtag1';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/hashtags/admin/find-all?page=${page}&sortBy=${sortBy}&nameContains=${nameContains}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('perPage should not be empty');
      });

      it('page should not be empty', async () => {
        const perPage = 3;
        const sortBy: HashtagsSortByType = 'name';
        const nameContains = 'hashtag1';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/hashtags/admin/find-all?&sortBy=${sortBy}&perPage=${perPage}&nameContains=${nameContains}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('page should not be empty');
      });

      it('sort should not be empty', async () => {
        const page = 1;
        const perPage = 3;
        const nameContains = 'hashtag1';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/hashtags/admin/find-all?page=${page}&perPage=${perPage}&nameContains=${nameContains}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('sortBy should not be empty');
      });
    });
  });
});
