import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
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

describe('Insert Many Hashtags Follow (e2e)', () => {
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

  let hashtag0;
  let hashtag1;
  let user0;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(userFactory.build(
      { userName: 'test-user1' },
    ));
    user0 = await usersService.create(userFactory.build(
      { userName: 'test-user1' },
    ));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    hashtag0 = await hashtagModel.create({
      name: 'scariness',
    });
    hashtag1 = await hashtagModel.create({
      name: 'evil',
    });
  });

  describe('GET /api/v1/users/:userId/hashtag-follows', () => {
    it('requires authentication', async () => {
      const userId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).get(`/api/v1/users/${userId}/hashtag-follows`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('insert many hashtags follow', () => {
      it('when insert many hashtags follow than expected response', async () => {
        const userId = activeUser.id;
        const hashtags = [hashtag0.name, hashtag1.name];
        const response = await request(app.getHttpServer())
          .post(`/api/v1/users/${userId}/hashtag-follows`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ hashtags });
        expect(response.body).toEqual([
          {
            notification: 0,
            userId,
            hashTagId: expect.any(String),
          },
          {
            notification: 0,
            userId,
            hashTagId: expect.any(String),
          },
        ]);
      });

      it('when hashtag is not exist than expected response', async () => {
        const userId = activeUser.id;
        const hashtags = ['misery', 'slasher'];
        const response = await request(app.getHttpServer())
          .post(`/api/v1/users/${userId}/hashtag-follows`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ hashtags });
        expect(response.body).toEqual({
          statusCode: 404,
          message: 'misery,slasher hashtag not found',
        });
      });

      it('when params id and login user id is not match than expected response', async () => {
        const userId = user0.id;
        const hashtags = ['misery', 'slasher'];
        const response = await request(app.getHttpServer())
          .post(`/api/v1/users/${userId}/hashtag-follows`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ hashtags });
        expect(response.body).toEqual({ statusCode: 401, message: 'Not authorized' });
      });
    });

    describe('Validation', () => {
      it('hashtag should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/users/${activeUser.id}/hashtag-follows`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ hashtags: '' });
        expect(response.body.message).toEqual([
          'hashtags must contain at least 1 elements',
          'hashtags must be an array',
          'hashtags should not be empty',
        ]);
      });

      it('hashtag should be a number', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/users/${activeUser.id}/hashtag-follows`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ hashtags: [] });
        expect(response.body.message).toContain('hashtags must contain at least 1 elements');
      });
    });
  });
});
