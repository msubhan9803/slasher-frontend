/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { UserSignInDto } from '../../../src/users/dto/user-sign-in.dto';
import { userFactory } from '../../factories/user.factory';
import { ActiveStatus } from '../../../src/schemas/user/user.enums';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { dropCollections } from '../../helpers/mongo-helpers';

describe('Users sign-in (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUser: UserDocument;
  let activeUserUnhashedPassword: string;
  const simpleJwtRegex = /^[\w-]*\.[\w-]*\.[\w-]*$/;
  const deviceAndAppVersionPlaceholderSignInFields = {
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
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await dropCollections(connection);

    activeUserUnhashedPassword = 'TestPassword';
    activeUser = await usersService.create(
      userFactory.build(
        { status: ActiveStatus.Active },
        { transient: { unhashedPassword: activeUserUnhashedPassword } },
      ),
    );
  });

  describe('POST /users/sign-in', () => {
    describe('An active user', () => {
      it('can successfully sign in with a username and password OR email and password', async () => {
        const postBodyScenarios: UserSignInDto[] = [
          {
            emailOrUsername: activeUser.userName,
            password: activeUserUnhashedPassword,
            ...deviceAndAppVersionPlaceholderSignInFields,
          },
          {
            emailOrUsername: activeUser.email,
            password: activeUserUnhashedPassword,
            ...deviceAndAppVersionPlaceholderSignInFields,
          },
        ];
        for (const postBody of postBodyScenarios) {
          const response = await request(app.getHttpServer())
            .post('/users/sign-in')
            .send(postBody);
          expect(response.status).toEqual(HttpStatus.CREATED); // 201 because a new sign-in session was created
          expect(response.body.email).toEqual(activeUser.email);
          expect(response.body.token).toMatch(simpleJwtRegex);
          expect(response.body.id).toMatch(activeUser.id);
          expect(response.body.userName).toMatch(activeUser.userName);
        }
      });
    });

    // This is temporary, but required during the beta release phase
    describe('A user who is not a beta tester', () => {
      it('receives an error message when attempting to sign in', async () => {
        const nonBetaUserUnhashedPassword = 'TestPassword';
        const nonBetaUser = await usersService.create(
          userFactory.build(
            { betaTester: false },
            { transient: { unhashedPassword: nonBetaUserUnhashedPassword } },
          ),
        );

        const postBody: UserSignInDto = {
          emailOrUsername: nonBetaUser.userName,
          password: nonBetaUserUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        return request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody)
          .expect(HttpStatus.UNAUTHORIZED)
          .expect({
            statusCode: 401,
            message: 'Only beta testers are able to sign in at this time, sorry!',
          });
      });
    });

    describe('An inactive user', () => {
      it('receives an error message when attempting to sign in', async () => {
        const inactiveUserUnhashedPassword = 'TestPassword';
        const inactiveUser = await usersService.create(
          userFactory.build(
            { status: ActiveStatus.Inactive },
            { transient: { unhashedPassword: inactiveUserUnhashedPassword } },
          ),
        );

        const postBody: UserSignInDto = {
          emailOrUsername: inactiveUser.userName,
          password: inactiveUserUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        return request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody)
          .expect(HttpStatus.UNAUTHORIZED)
          .expect({
            statusCode: 401,
            message: 'User account not yet activated.',
          });
      });
    });

    describe('A deactivated user', () => {
      it('receives an error message when attempting to sign in', async () => {
        const deactivatedUserUnhashedPassword = 'TestPassword';
        const deactivatedUser = await usersService.create(
          userFactory.build(
            { status: ActiveStatus.Deactivated },
            {
              transient: { unhashedPassword: deactivatedUserUnhashedPassword },
            },
          ),
        );
        const postBody: UserSignInDto = {
          emailOrUsername: deactivatedUser.userName,
          password: deactivatedUserUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        return request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody)
          .expect(HttpStatus.UNAUTHORIZED)
          .expect({
            statusCode: 401,
            message: 'User account has been deactivated.',
          });
      });
    });

    describe('DTO validations', () => {
      it('device_id should not be empty', async () => {
        const postBody = {
          ...deviceAndAppVersionPlaceholderSignInFields,
          device_id: '',
        };
        const response = await request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'device_id should not be empty',
        );
      });

      it('device_token should not be empty', async () => {
        const postBody = {
          ...deviceAndAppVersionPlaceholderSignInFields,
          device_token: '',
        };
        const response = await request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('device_token should not be empty');
      });

      it('device_type should not be empty', async () => {
        const postBody = {
          ...deviceAndAppVersionPlaceholderSignInFields,
          device_type: '',
        };
        const response = await request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('device_type should not be empty');
      });

      it('device_version should not be empty', async () => {
        const postBody = {
          ...deviceAndAppVersionPlaceholderSignInFields,
          device_version: '',
        };
        const response = await request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'device_version should not be empty',
        );
      });

      it('app_version should not be empty', async () => {
        const postBody = {
          ...deviceAndAppVersionPlaceholderSignInFields,
          app_version: '',
        };
        const response = await request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'app_version should not be empty',
        );
      });

      it('emailOrUsername should not be empty', async () => {
        const postBody = {
          ...deviceAndAppVersionPlaceholderSignInFields,
          emailOrUsername: '',
        };
        const response = await request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('emailOrUsername should not be empty');
      });

      it('password should not be empty', async () => {
        const postBody = {
          ...deviceAndAppVersionPlaceholderSignInFields,
          password: '',
        };
        const response = await request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('password should not be empty');
      });
    });

    describe('when user was deleted', () => {
      it('receives an error message when user was deleted', async () => {
        const userUnhashedPassword = 'TestPassword';
        const user = await usersService.create(
          userFactory.build(
            { deleted: true },
            { transient: { unhashedPassword: userUnhashedPassword } },
          ),
        );
        const postBody: UserSignInDto = {
          emailOrUsername: user.userName,
          password: userUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        const response = await request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toContain(
          'Incorrect username or password.',
        );
      });
    });

    describe('when user was suspended', () => {
      it('receives an error message when user was suspended', async () => {
        const userUnhashedPassword = 'TestPassword';
        const user = await usersService.create(
          userFactory.build(
            { userSuspended: true },
            { transient: { unhashedPassword: userUnhashedPassword } },
          ),
        );
        const postBody: UserSignInDto = {
          emailOrUsername: user.userName,
          password: userUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        const response = await request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toContain(
          'User suspended.',
        );
      });
    });

    describe('when user was banned', () => {
      it('receives an error message when user was banned', async () => {
        const userUnhashedPassword = 'TestPassword';
        const user = await usersService.create(
          userFactory.build(
            { userBanned: true },
            { transient: { unhashedPassword: userUnhashedPassword } },
          ),
        );
        const postBody: UserSignInDto = {
          emailOrUsername: user.userName,
          password: userUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        const response = await request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toContain(
          'User banned.',
        );
      });
    });

    describe('when user does not exist', () => {
      it('receives an error message when user does not exist', async () => {
        const userUnhashedPassword = 'TestPassword';
        await usersService.create(
          userFactory.build(
            {},
            { transient: { unhashedPassword: userUnhashedPassword } },
          ),
        );
        const postBody: UserSignInDto = {
          emailOrUsername: 'testusertestuser',
          password: userUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        const response = await request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toContain(
          'Incorrect username or password.',
        );
      });
    });

    describe('when user does exist but password is incorrect', () => {
      it('receives an error message when user does not exist but password is incorrect', async () => {
        const userUnhashedPassword = 'TestPassword';
        const user = await usersService.create(
          userFactory.build(
            {},
            { transient: { unhashedPassword: userUnhashedPassword } },
          ),
        );
        const postBody: UserSignInDto = {
          emailOrUsername: user.userName,
          password: `incorrect${userUnhashedPassword}`,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        const response = await request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
        expect(response.body.message).toContain(
          'Incorrect username or password.',
        );
      });
    });

    describe('after successful sign-in', () => {
      it('after a successful sign-in,'
        + 'the user database values for user.last_login and user.userDevices should have been updated', async () => {
          const userUnhashedPassword = 'TestPassword';
          const userBefore = await usersService.findByEmail(
            activeUser.email,
          );
          const postBody: any = {
            emailOrUsername: activeUser.userName,
            password: userUnhashedPassword,
            ...deviceAndAppVersionPlaceholderSignInFields,
          };
          const response = await request(app.getHttpServer())
            .post('/users/sign-in')
            .send(postBody);
          expect(response.status).toEqual(HttpStatus.CREATED);

          const userAfter = await usersService.findByEmail(
            response.body.email,
          );

          expect(userAfter.last_login).not.toBeNull();
          expect(userAfter.last_login).not.toEqual(userBefore.last_login);
          expect(userAfter.userDevices).toHaveLength(1);
          expect(userAfter.userDevices).not.toEqual(userBefore.userDevices);
        });
    });

    describe('check user device length', () => {
      let user;
      const userUnhashedPassword = 'password';
      beforeEach(async () => {
        const userDevices = [];
        for (let i = 1; i <= 10; i += 1) {
          const weekAgo = DateTime.now().minus({ days: i }).toISODate();
          userDevices.push(
            {
              ...deviceAndAppVersionPlaceholderSignInFields,
              device_id: `${i}`,
              login_date: weekAgo,
            },
          );
        }
        const userData = userFactory.build(
          {},
          { transient: { unhashedPassword: userUnhashedPassword } },
        );
        userData.userDevices = userDevices;
        user = await usersService.create(userData);
      });
      it('return devices that are available userDevices', async () => {
        const postBody: any = {
          emailOrUsername: user.userName,
          password: userUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        const response = await request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.CREATED);
        const userAfter = await usersService.findByEmail(
          response.body.email,
        );
        expect(userAfter.userDevices).toHaveLength(10);
        expect(user.userDevices).not.toEqual(userAfter.userDevices);
      });
    });

    describe('when device is exists than change in same device', () => {
      let user;
      const userUnhashedPassword = 'password';
      beforeEach(async () => {
        const userDevices = [];
        for (let i = 1; i <= 5; i += 1) {
          const weekAgo = DateTime.now().minus({ days: i }).toISODate();
          userDevices.push(
            {
              ...deviceAndAppVersionPlaceholderSignInFields,
              device_id: `${i}`,
              login_date: weekAgo,
            },
          );
        }
        const userData = userFactory.build(
          {},
          { transient: { unhashedPassword: userUnhashedPassword } },
        );
        userData.userDevices = userDevices;
        user = await usersService.create(userData);
      });
      it('returns the expected userDevices', async () => {
        const postBody: any = {
          emailOrUsername: user.userName,
          password: userUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
          device_id: '4',
        };
        const response = await request(app.getHttpServer())
          .post('/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.CREATED);
        const userAfter = await usersService.findByEmail(
          response.body.email,
        );
        expect(userAfter.userDevices).toHaveLength(5);
        expect(user.userDevices).not.toEqual(userAfter.userDevices);
      });
    });
  });
});
