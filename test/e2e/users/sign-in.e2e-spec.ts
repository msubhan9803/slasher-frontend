import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { UserDocument } from '../../../src/schemas/user.schema';
import { UserSignInDto } from '../../../src/users/dto/user-sign-in.dto';
import { userFactory } from '../../factories/user.factory';
import { ActiveStatus } from '../../../src/schemas/user.enums';

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
    connection = await moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();

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
  });
});
