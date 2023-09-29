import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
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
import { UserType } from '../../../../../src/schemas/user/user.enums';
import { HashtagActiveStatus } from '../../../../../src/schemas/hastag/hashtag.enums';

describe('Update Hashtag Name (e2e)', () => {
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

  describe('PATCH /api/v1/hashtags/admin/update-status/:id', () => {
    it('requires authentication', async () => {
      const id = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).patch(`/api/v1/hashtags/admin/update-status/${id}`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('only admins have access to this API', async () => {
      const id = new mongoose.Types.ObjectId();
      const status = HashtagActiveStatus.Active;
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/hashtags/admin/update-status/${id}`)
        .auth(user1AuthToken, { type: 'bearer' })
        .send({ status });
      expect(response.body).toEqual({ message: 'Only admins can access this API', statusCode: 404 });
    });

    describe('Update status of a hashtag', () => {
      it('return all hashtags with respective details', async () => {
        const hashtag = await hashtagModel.create({ name: 'my hashtag' });
        expect(hashtag.status).toBe(HashtagActiveStatus.Active);

        const status1 = HashtagActiveStatus.Inactive;
        const response1 = await request(app.getHttpServer())
          .patch(`/api/v1/hashtags/admin/update-status/${hashtag.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ status: status1 });
        expect(response1.body).toEqual({
          _id: expect.any(String),
          createdAt: expect.any(String),
          name: 'my hashtag',
          status: HashtagActiveStatus.Inactive,
        });

        const status2 = HashtagActiveStatus.Deactivated;
        const response2 = await request(app.getHttpServer())
          .patch(`/api/v1/hashtags/admin/update-status/${hashtag.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ status: status2 });
        expect(response2.body).toEqual({
          _id: expect.any(String),
          createdAt: expect.any(String),
          name: 'my hashtag',
          status: HashtagActiveStatus.Deactivated,
        });
      });
    });

    describe('Validation', () => {
      it('hashtag must exist', async () => {
        const id = new mongoose.Types.ObjectId();
        const status1 = HashtagActiveStatus.Inactive;
        const response1 = await request(app.getHttpServer())
          .patch(`/api/v1/hashtags/admin/update-status/${id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ status: status1 });
        expect(response1.body).toEqual({
          message: `Hashtag with id: ${id.toString()} not found!`,
          statusCode: 404,
        });
      });

      it('status should not be empty and valid', async () => {
        const hashtag = await hashtagModel.create({ name: 'my hashtag' });
        expect(hashtag.status).toBe(HashtagActiveStatus.Active);

        const response1 = await request(app.getHttpServer())
          .patch(`/api/v1/hashtags/admin/update-status/${hashtag.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response1.body).toEqual({
          error: 'Bad Request',
          message: [
            'status can be 0, 1 or 2',
            'status can be 0, 1 or 2',
            'status must be an integer number',
            'status must be a number conforming to the specified constraints',
            'status should not be empty',
          ],
          statusCode: 400,
        });
      });
    });
  });
});
