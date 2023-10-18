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
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { HashtagFollowsService } from '../../../../../src/hashtag-follows/providers/hashtag-follows.service';
import { HashtagService } from '../../../../../src/hashtag/providers/hashtag.service';

describe('Followed Hashtags (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let hashtagFollowsService: HashtagFollowsService;
  let hashtagService: HashtagService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    hashtagService = moduleRef.get<HashtagService>(HashtagService);
    hashtagFollowsService = moduleRef.get<HashtagFollowsService>(HashtagFollowsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let hashtag1;
  let hashtag2;
  let hashtag3;

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(userFactory.build());
    hashtag1 = await hashtagService.createOrUpdateHashtags(['horror']);
    hashtag2 = await hashtagService.createOrUpdateHashtags(['horrormovie']);
    hashtag3 = await hashtagService.createOrUpdateHashtags(['horrorname']);

    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    await hashtagFollowsService.create({
      userId: activeUser._id,
      hashTagId: hashtag1[0]._id,
    });
    await hashtagFollowsService.create({
      userId: activeUser._id,
      hashTagId: hashtag2[0]._id,
    });
    await hashtagFollowsService.create({
      userId: activeUser._id,
      hashTagId: hashtag3[0]._id,
    });
  });

  describe('GET /api/v1/users/:userId/hashtag-follows', () => {
    it('requires authentication', async () => {
      const userId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).get(
        `/api/v1/users/${userId}/hashtag-follows`,
      ).expect(HttpStatus.UNAUTHORIZED);
    });

    it('get the hashtag follows successful if query parameter limit, offset and query are exists', async () => {
      const limit = 2;
      const offset = 1;
      const query = 'ho';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${activeUser._id.toString()}/hashtag-follows?limit=${limit}&offset=${offset}&query=${query}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([
        {
          notification: 0,
          userId: activeUser._id.toString(),
          hashTagId: {
            _id: hashtag2[0].id,
            name: 'horrormovie',
            totalPost: 1,
          },
        },
        {
          notification: 0,
          userId: activeUser._id.toString(),
          hashTagId: {
            _id: hashtag3[0].id,
            name: 'horrorname',
            totalPost: 1,
          },
        },
      ]);
    });

    it('get the hashtag follows successful if query parameter limit is exists', async () => {
      const limit = 2;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${activeUser._id.toString()}/hashtag-follows?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();

      expect(response.body).toEqual([
        {
          notification: 0,
          userId: activeUser._id.toString(),
          hashTagId: {
            _id: hashtag1[0].id,
            name: 'horror',
            totalPost: 1,
          },
        },
        {
          notification: 0,
          userId: activeUser._id.toString(),
          hashTagId: {
            _id: hashtag2[0].id,
            name: 'horrormovie',
            totalPost: 1,
          },
        },
      ]);
    });

    it('get the hashtag follows successful if query parameter limit and offset are exists', async () => {
      const limit = 1;
      const offset = 1;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${activeUser._id.toString()}/hashtag-follows?limit=${limit}&offset=${offset}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();

      expect(response.body).toEqual([
        {
          notification: 0,
          userId: activeUser._id.toString(),
          hashTagId: {
            _id: hashtag2[0].id,
            name: 'horrormovie',
            totalPost: 1,
          },
        },
      ]);
    });

    it('get the hashtag follows successful if query parameter limit and query are exists', async () => {
      const limit = 1;
      const query = 'ho';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${activeUser._id.toString()}/hashtag-follows?limit=${limit}&query=${query}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();

      expect(response.body).toEqual([
        {
          notification: 0,
          userId: activeUser._id.toString(),
          hashTagId: { _id: hashtag1[0].id, name: 'horror', totalPost: 1 },
        },
      ]);
    });

    it("returns the expected error response when a user tries to get another user's hashtag-follow status", async () => {
      const limit = 2;
      const offset = 1;
      const differentUserId = '6337f478980180f44e64487c';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${differentUserId}/hashtag-follows?limit=${limit}&offset=${offset}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
      expect(response.body).toEqual({
        message: 'Not authorized',
        statusCode: 401,
      });
    });

    describe('Validation', () => {
      it('userId must be a mongodb id', async () => {
        const limit = 2;
        const offset = 1;
        const activeUserId = '634912b22c2f4f5edsamkm2m';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUserId}/hashtag-follows?limit=${limit}&offset=${offset}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toEqual(['userId must be a mongodb id']);
      });

      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser._id.toString()}/hashtag-follows`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          statusCode: 400,
          message: [
            'limit must not be greater than 30',
            'limit must be a number conforming to the specified constraints',
            'limit should not be empty',
          ],
          error: 'Bad Request',
        });
      });
    });
  });
});
