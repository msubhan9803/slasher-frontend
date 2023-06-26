/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { UserSignInDto } from '../../../../../src/users/dto/user-sign-in.dto';
import { userFactory } from '../../../../factories/user.factory';
import { ActiveStatus } from '../../../../../src/schemas/user/user.enums';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
// import { BetaTestersService } from '../../../../../src/beta-tester/providers/beta-testers.service';

describe('Users sign-in (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUser: UserDocument;
  let activeUserUnhashedPassword: string;
  // let betaTestersService: BetaTestersService;

  const simpleJwtRegex = /^[\w-]*\.[\w-]*\.[\w-]*$/;
  const deviceAndAppVersionPlaceholderSignInFields = {
    device_id: 'sample-device-id',
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
    // betaTestersService = moduleRef.get<BetaTestersService>(BetaTestersService);
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

    activeUserUnhashedPassword = 'TestPassword';
    activeUser = await usersService.create(
      userFactory.build(
        { status: ActiveStatus.Active },
        { transient: { unhashedPassword: activeUserUnhashedPassword } },
      ),
    );
  });

  describe('POST /api/v1/users/sign-in', () => {
    describe('An active user', () => {
      it('can successfully sign in with a username and password OR email and password', async () => {
        const postBodyScenarios: Partial<UserSignInDto>[] = [
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
            .post('/api/v1/users/sign-in')
            .send(postBody);
          expect(response.status).toEqual(HttpStatus.CREATED); // 201 because a new sign-in session was created
          expect(response.body).toEqual({
            id: activeUser.id,
            userName: 'Username1',
            email: 'User1@Example.com',
            firstName: 'First name 1',
            token: expect.stringMatching(simpleJwtRegex),
          });
        }
      });

      it('updates the lastSignInIp when the user signs in', async () => {
        const userBeforeSignIn = await usersService.findByEmail(activeUser.email, true);
        await request(app.getHttpServer())
          .post('/api/v1/users/sign-in')
          .send({
            emailOrUsername: activeUser.email,
            password: activeUserUnhashedPassword,
            ...deviceAndAppVersionPlaceholderSignInFields,
          });
        const userAfterSignIn = await usersService.findByEmail(activeUser.email, true);
        expect(userAfterSignIn.lastSignInIp.length).toBeGreaterThan(4); // test for presence of IP value
        expect(userAfterSignIn.lastSignInIp).not.toEqual(userBeforeSignIn.lastSignInIp); // make sure IP value has changed
      });

      it('can successfully sign in with a username and password with device token', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/sign-in')
          .send({
            emailOrUsername: activeUser.email,
            password: activeUserUnhashedPassword,
            device_token: 'sample-device-token',
            ...deviceAndAppVersionPlaceholderSignInFields,
          });
        expect(response.status).toEqual(HttpStatus.CREATED); // 201 because a new sign-in session was created
        expect(response.body).toEqual({
          id: activeUser.id,
          userName: 'Username1',
          email: 'User1@Example.com',
          firstName: 'First name 1',
          token: expect.stringMatching(simpleJwtRegex),
        });
      });
    });

    // We're no longer restricting login to beta testers, so this code is commented out.
    // TODO: We can probably remove this, but I'm keeping it here for a little while longer
    // in case we need to bring it back for any reason.

    // describe('A user who is not a beta tester', () => {
    //   it('receives an error message when attempting to sign in', async () => {
    //     const nonBetaUserUnhashedPassword = 'TestPassword';
    //     const nonBetaUser = await usersService.create(
    //       userFactory.build(
    //         { betaTester: false },
    //         { transient: { unhashedPassword: nonBetaUserUnhashedPassword } },
    //       ),
    //     );

    //     const postBody: UserSignInDto = {
    //       emailOrUsername: nonBetaUser.userName,
    //       password: nonBetaUserUnhashedPassword,
    //       ...deviceAndAppVersionPlaceholderSignInFields,
    //     };
    //     return request(app.getHttpServer())
    //       .post('/api/v1/users/sign-in')
    //       .send(postBody)
    //       .expect(HttpStatus.UNAUTHORIZED)
    //       .expect({
    //         statusCode: 401,
    //         message: 'Only people who requested an invitation are able to sign in during the sneak preview.',
    //       });
    //   });

    //   it('when user is not marked as a beta tester yet, but user.email exists in the BetaTester collection,'
    //     + 'the user is allowed to sign in and is marked as a betaTester going forward', async () => {
    //       const nonBetaUserUnhashedPassword = 'TestPassword';
    //       const nonBetaUser = await usersService.create(
    //         userFactory.build(
    //           { betaTester: false },
    //           { transient: { unhashedPassword: nonBetaUserUnhashedPassword } },
    //         ),
    //       );

    //       await betaTestersService.create(
    //         betaTesterFactory.build(
    //           { name: 'TestUser', email: nonBetaUser.email },
    //         ),
    //       );
    //       const postBody: UserSignInDto = {
    //         emailOrUsername: nonBetaUser.email,
    //         password: nonBetaUserUnhashedPassword,
    //         ...deviceAndAppVersionPlaceholderSignInFields,
    //       };
    //       const response = await request(app.getHttpServer())
    //         .post('/api/v1/users/sign-in')
    //         .send(postBody)
    //         .expect(HttpStatus.CREATED);
    //       expect(response.body).toEqual({
    //         id: nonBetaUser.id,
    //         userName: 'Username2',
    //         email: 'User2@Example.com',
    //         firstName: 'First name 2',
    //         token: expect.stringMatching(simpleJwtRegex),
    //       });
    //       const user = await usersService.findById(response.body.id, true);
    //       expect(user.betaTester).toBe(true);
    //     });
    // });

    describe('An inactive user', () => {
      it('receives an error message when attempting to sign in', async () => {
        const inactiveUserUnhashedPassword = 'TestPassword';
        const inactiveUser = await usersService.create(
          userFactory.build(
            { status: ActiveStatus.Inactive },
            { transient: { unhashedPassword: inactiveUserUnhashedPassword } },
          ),
        );
        const postBody: Partial<UserSignInDto> = {
          emailOrUsername: inactiveUser.userName,
          password: inactiveUserUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        return request(app.getHttpServer())
          .post('/api/v1/users/sign-in')
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
        const postBody: Partial<UserSignInDto> = {
          emailOrUsername: deactivatedUser.userName,
          password: deactivatedUserUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        return request(app.getHttpServer())
          .post('/api/v1/users/sign-in')
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
          .post('/api/v1/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'device_id should not be empty',
        );
      });

      it('device_type should not be empty', async () => {
        const postBody = {
          ...deviceAndAppVersionPlaceholderSignInFields,
          device_type: '',
        };
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/sign-in')
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
          .post('/api/v1/users/sign-in')
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
          .post('/api/v1/users/sign-in')
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
          .post('/api/v1/users/sign-in')
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
          .post('/api/v1/users/sign-in')
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
        const postBody: Partial<UserSignInDto> = {
          emailOrUsername: user.userName,
          password: userUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/sign-in')
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
        const postBody: Partial<UserSignInDto> = {
          emailOrUsername: user.userName,
          password: userUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/sign-in')
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
        const postBody: Partial<UserSignInDto> = {
          emailOrUsername: user.userName,
          password: userUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/sign-in')
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
        const postBody: Partial<UserSignInDto> = {
          emailOrUsername: 'testusertestuser',
          password: userUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/sign-in')
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
        const postBody: Partial<UserSignInDto> = {
          emailOrUsername: user.userName,
          password: `incorrect${userUnhashedPassword}`,
          ...deviceAndAppVersionPlaceholderSignInFields,
        };
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/sign-in')
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
          const userBefore = await usersService.findByEmail(activeUser.email, true);
          const postBody: any = {
            emailOrUsername: activeUser.userName,
            password: userUnhashedPassword,
            ...deviceAndAppVersionPlaceholderSignInFields,
          };
          const response = await request(app.getHttpServer())
            .post('/api/v1/users/sign-in')
            .send(postBody);
          expect(response.status).toEqual(HttpStatus.CREATED);

          const userAfter = await usersService.findByEmail(response.body.email, true);

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
        for (let i = 1; i <= 30; i += 1) {
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
          .post('/api/v1/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.CREATED);
        const userAfter = await usersService.findByEmail(response.body.email, true);
        expect(userAfter.userDevices).toHaveLength(30);
        expect(user.userDevices).not.toEqual(userAfter.userDevices);
      });
    });

    describe('when latest user device is already among the set of known user devices', () => {
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

      it('updates the existing user device entry and does not add a new one', async () => {
        const postBody: any = {
          emailOrUsername: user.userName,
          password: userUnhashedPassword,
          ...deviceAndAppVersionPlaceholderSignInFields,
          device_id: '4',
        };
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/sign-in')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.CREATED);
        const userAfter = await usersService.findByEmail(response.body.email, true);
        expect(userAfter.userDevices).toHaveLength(5);
        expect(user.userDevices).not.toEqual(userAfter.userDevices);
      });
    });
  });
});
