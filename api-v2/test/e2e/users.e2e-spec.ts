import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../src/app.module';
import { UsersService } from '../../src/users/providers/users.service';
import { ActiveStatus, User } from '../../src/schemas/user.schema';
import { UserSignInDto } from '../../src/users/dto/user-sign-in.dto';
import { UserRegisterDto } from '../../src/users/dto/user-register.dto';
import { userFactory } from '../factories/user.factory';
import * as bcrypt from 'bcryptjs';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUser: User;
  let activeUserUnhashedPassword: string;
  const simpleJwtRegex = /^[\w-]*\.[\w-]*\.[\w-]*$/;
  const deviceAndAppVersionPlaceholderSignInFields = {
    device_id: 'sample-device-id',
    device_token: 'sample-device-token',
    device_type: 'sample-device-type',
    device_version: 'sample-device-version',
    app_version: 'sample-app-version',
  };

  const sampleUserRegisterObject = {
    firstName: 'user',
    userName: 'TestUser',
    email: 'testuser@gmail.com',
    password: 'TestUser@123',
    passwordConfirmation: 'TestUser@123',
    securityQuestion: 'What is favourite food?',
    securityAnswer: 'Pizza',
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
  });

  describe('POST /users/register', () => {
    describe('Successful Registration', () => {
      it('can successfully register with given user data', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
          .expect(HttpStatus.CREATED);
        const registeredUser = await usersService.findById(response.body._id);

        expect(postBody.firstName).toEqual(registeredUser.firstName);
        expect(postBody.userName).toEqual(registeredUser.userName);
        expect(postBody.email).toEqual(registeredUser.email);
        expect(postBody.securityQuestion).toEqual(
          registeredUser.securityQuestion,
        );
        expect(postBody.securityAnswer).toEqual(registeredUser.securityAnswer);
        expect(
          bcrypt.compareSync(postBody.password, registeredUser.password),
        ).toEqual(true);
      });
    });

    describe('Validation', () => {
      it('firstName should not be empty', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        postBody.firstName = '';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'firstName should not be empty',
        );
      });

      it('userName should not be empty', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        postBody.userName = '';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('userName should not be empty');
      });

      it('userName is not longer than 30 characters', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        postBody.userName = 'TestUserTestUserTestUserTestUser';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userName must be shorter than or equal to 30 characters',
        );
      });

      it('email should not be empty', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        postBody.email = '';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('email should not be empty');
      });

      it('email is a proper-form email', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        postBody.email = 'testusergmail.com';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('email must be an email');
      });

      it('password should not be empty', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        postBody.password = '';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('password should not be empty');
      });

      it('password should match pattern', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        postBody.password = 'testuser123';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'password must match /^(?=.*[A-Z])(?=.*[?!@#$%^&*()_+=,-])[a-zA-Z0-9?!@#$%^&*()-_+=,]{8,}$/ regular expression',
        );
      });

      it('passwordConfirmation should not be empty', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        postBody.passwordConfirmation = '';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'passwordConfirmation should not be empty',
        );
      });

      it('password and passwordConfirmation match', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        postBody.passwordConfirmation = 'TestUser@1234';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'passwordConfirmation must match password exactly',
        );
      });

      it('securityQuestion should not be empty', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        postBody.securityQuestion = '';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'securityQuestion should not be empty',
        );
      });

      it('securityQuestion is at least 10 characters long', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        postBody.securityQuestion = 'Nickname?';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'securityQuestion must be longer than or equal to 10 characters',
        );
      });

      it('securityAnswer should not be empty', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        postBody.securityAnswer = '';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'securityAnswer should not be empty',
        );
      });

      it('securityAnswer is at least 5 characters long', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        postBody.securityAnswer = 'Nick';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'securityAnswer must be longer than or equal to 5 characters',
        );
      });
    });

    describe('User exist', () => {
      it('userName already exists', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        let response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.CREATED);

        response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.message).toContain(
          'Username is already associated with an existing user.',
        );
      });

      it('email already exists', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject,
        };
        let response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.CREATED);

        postBody.userName = 'TestUser2';
        response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.message).toContain(
          'Email address is already associated with an existing user.',
        );
      });
    });
  });
});
