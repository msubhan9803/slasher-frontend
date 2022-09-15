import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { DateTime } from 'luxon';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { validUuidV4Regex } from '../../helpers/regular-expressions';

describe('Users / Register (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;

  const sampleUserRegisterObject = {
    firstName: 'user',
    userName: 'TestUser',
    email: 'testuser@gmail.com',
    password: 'TestUser@123',
    passwordConfirmation: 'TestUser@123',
    securityQuestion: 'What is favourite food?',
    securityAnswer: 'Pizza',
    dob: DateTime.now().minus({ years: 18 }).toISODate(),
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
  });

  describe('POST /users/register', () => {
    let postBody: any;
    beforeEach(() => {
      postBody = { ...sampleUserRegisterObject };
    });

    describe('Successful Registration', () => {
      it('can successfully register with given user data', async () => {
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody)
          .expect(HttpStatus.CREATED);
        const registeredUser = await usersService.findById(response.body.id);

        expect(postBody.firstName).toEqual(registeredUser.firstName);
        expect(postBody.userName).toEqual(registeredUser.userName);
        expect(postBody.email).toEqual(registeredUser.email);
        expect(postBody.securityQuestion).toEqual(
          registeredUser.securityQuestion,
        );
        expect(postBody.securityAnswer).toEqual(registeredUser.securityAnswer);
        expect(
          bcrypt.compareSync(postBody.password, registeredUser.password),
        ).toBe(true);
        expect(registeredUser.verification_token).toMatch(validUuidV4Regex);
        expect(DateTime.fromISO(postBody.dob, { zone: 'utc' }).toJSDate()).toEqual(registeredUser.dob);
      });
    });

    describe('Validation', () => {
      it('firstName should not be empty', async () => {
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
        postBody.userName = '';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('userName should not be empty');
      });

      it('userName is not longer than 30 characters', async () => {
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
        postBody.email = '';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('email should not be empty');
      });

      it('email is a proper-form email', async () => {
        postBody.email = 'testusergmail.com';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('email must be an email');
      });

      it('password should not be empty', async () => {
        postBody.password = '';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('password should not be empty');
      });

      it('password should match pattern', async () => {
        postBody.password = 'testuser123';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'Password must be at least 8 characters long, contain at least one (1) capital letter, '
          + 'and contain at least one (1) special character.',
        );
      });

      it('passwordConfirmation should not be empty', async () => {
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
        postBody.securityAnswer = 'Nick';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'securityAnswer must be longer than or equal to 5 characters',
        );
      });

      it('dob should not be empty', async () => {
        postBody.dob = '';
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('dob should not be empty');
      });

      it('dob is under age', async () => {
        postBody.dob = DateTime.now().minus({ years: 17, months: 11 }).toISODate();
        const response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('You must be at least 18 to register');
      });
    });

    describe('Existing username or email check', () => {
      it('returns an error when userName already exists', async () => {
        let response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.CREATED);

        postBody.email = `different${postBody.email}`;
        response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.message).toContain(
          'Username is already associated with an existing user.',
        );
      });

      it('returns an error when email already exists', async () => {
        let response = await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.CREATED);

        postBody.userName = `Different${postBody.userName}`;
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
