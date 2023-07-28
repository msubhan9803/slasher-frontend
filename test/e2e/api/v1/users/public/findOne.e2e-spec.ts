import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../../src/app.module';
import { UsersService } from '../../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../../factories/user.factory';
import { UserDocument } from '../../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../../helpers/mongo-helpers';
import { ProfileVisibility } from '../../../../../../src/schemas/user/user.enums';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../../helpers/factory-helpers.ts';

describe('GET /users/:id (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUser: UserDocument;
  let otherUser: UserDocument;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
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
  });

  describe('GET /api/v1/users/public/:userNameOrId', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      otherUser = await usersService.create(userFactory.build({
        profile_status: ProfileVisibility.Private,
      }));
    });

    describe('Find a user by id', () => {
      it('returns the expected response when try to find the user data by id', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/public/${activeUser.id}`)
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: activeUser.id,
          firstName: 'First name 1',
          userName: 'Username1',
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          coverPhoto: null,
          aboutMe: 'Hello. This is me.',
          profile_status: ProfileVisibility.Public,
          friendsCount: 0,
          imagesCount: 0,
          postsCount: 0,
        });
      });

      it('returns the expected response when the user is not found', async () => {
        const nonExistentUserId = '5d1df8ebe9a186319c225cd6';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/public/${nonExistentUserId}`)
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'User not found',
          statusCode: 404,
        });
      });
    });

    describe('Find a user by userName', () => {
      it('returns the expected user', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/public/${activeUser.userName}`)
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: activeUser.id,
          firstName: 'First name 1',
          userName: 'Username1',
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          coverPhoto: null,
          aboutMe: 'Hello. This is me.',
          profile_status: ProfileVisibility.Public,
          friendsCount: 0,
          imagesCount: 0,
          postsCount: 0,
        });
      });

      it('returns the expected response when the user is not found', async () => {
        const nonExistentUserName = `No${activeUser.userName}`;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/public/${nonExistentUserName}`)
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'User not found',
          statusCode: 404,
        });
      });

      it('returns the expected user with private profile status', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/public/${otherUser.userName}`)
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          firstName: 'First name 2',
          userName: 'Username2',
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          coverPhoto: null,
          aboutMe: null,
          profile_status: ProfileVisibility.Private,
          friendsCount: 0,
          imagesCount: 0,
          postsCount: 0,
        });
      });
    });
  });
});
