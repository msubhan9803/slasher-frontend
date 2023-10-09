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

describe('Fetch User Followed Hashtag (e2e)', () => {
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

  let hashtag;
  let hashtag1;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(userFactory.build());
    hashtag = await hashtagService.createOrUpdateHashtags(['ok']);
    hashtag1 = await hashtagService.createOrUpdateHashtags(['hello']);

    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    await hashtagFollowsService.create({
      userId: activeUser._id,
      hashTagId: hashtag[0]._id,
    });
  });

  describe('GET /api/v1/users/:userId/hashtag-follows/:hashtag', () => {
    it('requires authentication', async () => {
      const userId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).put(
        `/api/v1/users/${userId}/hashtag-follows/${hashtag}`,
      ).expect(HttpStatus.UNAUTHORIZED);
    });

    it('get the hashtag follows successful if parameter hashtag and userId is exists', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${activeUser._id.toString()}/hashtag-follows/${hashtag[0].name}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual({
        notification: 0,
        hashTagId: hashtag[0].id,
      });
    });

    it('returns the expected response when the hashtag is not found', async () => {
      const hashtagName = 'slasherhashtagname';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${activeUser._id.toString()}/hashtag-follows/${hashtagName}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({
        message: 'Hashtag not found',
        statusCode: 404,
      });
    });

    it('returns the expected response when the hashtag follow is not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${activeUser._id.toString()}/hashtag-follows/${hashtag1[0].name}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();

      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      expect(response.body).toEqual({
        message: 'Hashtag follow not found',
        statusCode: 404,
      });
    });

    it("returns the expected error response when a user tries to get another user's hashtag-follow status", async () => {
      const differentUserId = '6337f478980180f44e64487c';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${differentUserId}/hashtag-follows/${hashtag[0].name}`)
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
        const activeUserId = '634912b22c2f4f5edsamkm2m';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUserId}/hashtag-follows/${hashtag[0].name}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toEqual(['userId must be a mongodb id']);
      });
    });
  });
});
