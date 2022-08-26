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
import { UserRegisterDto } from '../../src/users/dto/user-register.dto';
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

  const sampleUserRegisterObject = {
    'firstName': 'user',
    'userName': 'TestUser',
    'email': 'testuser@gmail.com',
    'password': 'TestUser@123',
    'passwordConfirmation': 'TestUser@123',
    'securityQuestion': 'What is favourite food?',
    'securityAnswer': 'Pizza'
  }

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

  describe('POST /users/login', () => {
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

  describe('GET /users/register', () => {
    describe('Successful Registration', () => {
      it('can successfully register with given user data', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        return request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
          .expect(HttpStatus.CREATED)
      });
    });

    describe('Validation', () => {
      it('firstName should not be empty', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        postBody.firstName = ''
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('firstName should not be empty');
      });

      it('userName should not be empty', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        postBody.userName = ''
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('userName should not be empty');
      });

      it('userName is not longer than 30 characters', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        postBody.userName = 'TestUserTestUserTestUserTestUser'
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('userName must be shorter than or equal to 30 characters');
      });

      it('email should not be empty', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        postBody.email = ''
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('email should not be empty');
      });

      it('email is a proper-form email', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        postBody.email = 'testusergmail.com'
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('email must be an email');
      });

      it('password should not be empty', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        postBody.password = ''
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('password should not be empty');  
      });

      it('password should match pattern', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        postBody.password = 'testuser123'
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('password must match /^(?=.*[A-Z])(?=.*[?!@#$%^&*()_+=,-])[a-zA-Z0-9?!@#$%^&*()-_+=,]{8,}$/ regular expression');  
      });

      it('passwordConfirmation should not be empty', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        postBody.passwordConfirmation = ''
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('passwordConfirmation should not be empty');
      });

      it('password and passwordConfirmation match', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        postBody.passwordConfirmation = 'TestUser@1234'
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('passwordConfirmation must match password exactly');
      });

      it('securityQuestion should not be empty', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        postBody.securityQuestion = ''
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('securityQuestion should not be empty');
      });

      it('securityQuestion is at least 10 characters long', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        postBody.securityQuestion = 'Nickname?'
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('securityQuestion must be longer than or equal to 10 characters');
      });

      it('securityAnswer should not be empty', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        postBody.securityAnswer = ''
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('securityAnswer should not be empty');
      });

      it('securityAnswer is at least 5 characters long', async () => {
        const postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        postBody.securityAnswer = 'Nick'
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('securityAnswer must be longer than or equal to 5 characters');
      });
    });

    describe('User exist', () => {
      it('userName already exists', async () => {
        let postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        let response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.CREATED);

        response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.message).toContain('Username already exist');
      });

      it('email already exists', async () => {
        let postBody: UserRegisterDto = {
          ...sampleUserRegisterObject
        };
        let response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.CREATED);

        postBody.userName = 'TestUser2'
        response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.message).toContain('Email already exist');
      });
    });
  });
});
