import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { UsersService } from '../../src/users/providers/users.service';
import {
  ActiveStatus,
  User,
  UserDocument,
} from '../../src/schemas/user.schema';
import { UserLoginDto } from '../../src/users/dto/user-login.dto';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { truncateAllCollections } from '../test-helpers';
import { userFactory } from '../factories/user.factory';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let userModel: Model<UserDocument>;
  let activeUser: User;
  let activeUserUnhashedPassword: string;
  const simpleJwtRegex = /^[\w-]*\.[\w-]*\.[\w-]*$/;
  const deviceAndAppVersionPlaceholderLoginFields = {
    device_id: 'sample-device-id',
    device_token: 'sample-device-token',
    device_type: 'sample-device-type',
    device_version: 'sample-device-version',
    app_version: 'sample-app-version',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    userModel = moduleRef.get<Model<UserDocument>>(getModelToken(User.name));
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Truncate all db collections so we start fresh before each test
    await truncateAllCollections(userModel);

    activeUserUnhashedPassword = 'TestPassword';
    activeUser = await usersService.create(
      userFactory.build(
        { status: ActiveStatus.Active },
        { transient: { unhashedPassword: activeUserUnhashedPassword } },
      ),
    );
  });

  describe('GET /users/login', () => {
    describe('An active user', () => {
      it('can successfully log in with a username and password OR email and password', async () => {
        const postBodyScenarios: UserLoginDto[] = [
          {
            emailOrUsername: activeUser.userName,
            password: activeUserUnhashedPassword,
            ...deviceAndAppVersionPlaceholderLoginFields,
          },
          {
            emailOrUsername: activeUser.email,
            password: activeUserUnhashedPassword,
            ...deviceAndAppVersionPlaceholderLoginFields,
          },
        ];
        for (const postBody of postBodyScenarios) {
          const response = await request(app.getHttpServer())
            .post('/users/login')
            .send(postBody);
          expect(response.status).toEqual(HttpStatus.CREATED); // 201 because a new login session was created
          expect(response.body.email).toEqual(activeUser.email);
          expect(response.body.token).toMatch(simpleJwtRegex);
        }
      });
    });

    describe('An inactive user', () => {
      it('receives an error message when attempting to log in', async () => {
        const inactiveUserUnhashedPassword = 'TestPassword';
        const inactiveUser = await usersService.create(
          userFactory.build(
            { status: ActiveStatus.Inactive },
            { transient: { unhashedPassword: inactiveUserUnhashedPassword } },
          ),
        );

        const postBody: UserLoginDto = {
          emailOrUsername: inactiveUser.userName,
          password: inactiveUserUnhashedPassword,
          ...deviceAndAppVersionPlaceholderLoginFields,
        };
        return request(app.getHttpServer())
          .post('/users/login')
          .send(postBody)
          .expect(HttpStatus.UNAUTHORIZED)
          .expect({
            statusCode: 401,
            message: 'User account not yet activated.',
          });
      });
    });

    describe('A deactivated user', () => {
      it('receives an error message when attempting to log in', async () => {
        const deactivatedUserUnhashedPassword = 'TestPassword';
        const deactivatedUser = await usersService.create(
          userFactory.build(
            { status: ActiveStatus.Deactivated },
            {
              transient: { unhashedPassword: deactivatedUserUnhashedPassword },
            },
          ),
        );
        const postBody: UserLoginDto = {
          emailOrUsername: deactivatedUser.userName,
          password: deactivatedUserUnhashedPassword,
          ...deviceAndAppVersionPlaceholderLoginFields,
        };
        return request(app.getHttpServer())
          .post('/users/login')
          .send(postBody)
          .expect(HttpStatus.UNAUTHORIZED)
          .expect({
            statusCode: 401,
            message: 'User account has been deactivated.',
          });
      });
    });
  });
});
