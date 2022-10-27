import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { relativeToFullImagePath } from '../../../src/utils/image-utils';

describe('GET /users/:id (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

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
    await connection.dropDatabase();
  });

  describe('GET /users/:idOrUserName', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
    });

    describe('Find a user by id', () => {
      it('returns the expected user', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          id: activeUser.id,
          aboutMe: activeUser.aboutMe,
          email: activeUser.email,
          userName: activeUser.userName,
          firstName: activeUser.firstName,
          profilePic: relativeToFullImagePath(configService, activeUser.profilePic),
          coverPhoto: relativeToFullImagePath(configService, null),
        });
      });

      it('returns the expected response when the user is not found', async () => {
        const nonExistentUserId = '5d1df8ebe9a186319c225cd6';
        const response = await request(app.getHttpServer())
          .get(`/users/${nonExistentUserId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
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
          .get(`/users/${activeUser.userName}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          id: activeUser.id,
          aboutMe: activeUser.aboutMe,
          email: activeUser.email,
          userName: activeUser.userName,
          firstName: activeUser.firstName,
          profilePic: relativeToFullImagePath(configService, activeUser.profilePic),
          coverPhoto: relativeToFullImagePath(configService, null),
        });
      });

      it('returns the expected response when the user is not found', async () => {
        const nonExistentUserName = `No${activeUser.userName}`;
        const response = await request(app.getHttpServer())
          .get(`/users/${nonExistentUserName}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'User not found',
          statusCode: 404,
        });
      });
    });
  });
});
