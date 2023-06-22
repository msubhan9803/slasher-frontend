/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { AppModule } from '../../../../../src/app.module';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { DisallowedUsernameService } from '../../../../../src/disallowedUsername/providers/disallowed-username.service';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { BetaTestersService } from '../../../../../src/beta-tester/providers/beta-testers.service';
import { betaTesterFactory } from '../../../../factories/beta-tester.factory';
import { CaptchaService } from '../../../../../src/captcha/captcha.service';

describe('Users / Register (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let disallowedUsernameService: DisallowedUsernameService;
  let betaTestersService: BetaTestersService;
  let captchaService: CaptchaService;

  const sampleUserRegisterObject = {
    firstName: 'user',
    userName: 'TestUser',
    email: 'testuser@gmail.com',
    password: 'TestUser@123',
    passwordConfirmation: 'TestUser@123',
    securityQuestion: 'What is favourite food?',
    securityAnswer: 'Pizza',
    dob: DateTime.now().minus({ years: 18 }).toISODate(),
    reCaptchaToken: '48ed6df1-a1f2-4267-a3b9-7aadafbca5b3',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    disallowedUsernameService = moduleRef.get<DisallowedUsernameService>(DisallowedUsernameService);
    betaTestersService = moduleRef.get<BetaTestersService>(BetaTestersService);
    captchaService = moduleRef.get<CaptchaService>(CaptchaService);

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

    await betaTestersService.create(
      betaTesterFactory.build(
        { name: 'TestUser', email: 'differenttestuser@gmail.com' },
      ),
    );

    await betaTestersService.create(
      betaTesterFactory.build(
        { name: 'TestUser', email: 'testuser@gmail.com' },
      ),
    );

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
  });

  describe('POST /api/v1/users/register', () => {
    let postBody: any;
    beforeEach(() => {
      postBody = { ...sampleUserRegisterObject };
    });

    describe('Successful validation', () => {
      it('can successfully validation with given user data', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.body).toHaveLength(0);
      });

      // TODO: Remove this check once the beta period is over
      it('can successfully allow an approved beta tester with case-insensitive beta tester email check', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query({
            ...postBody,
            email: postBody.email.toUpperCase(),
          });
        expect(response.body).toHaveLength(0);
      });
    });

    describe('Validation', () => {
      it('You must provide at least one field for validation.', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query({});
        expect(response.body).toEqual({
          message: 'You must provide at least one field for validation.',
          statusCode: HttpStatus.NOT_ACCEPTABLE,
        });
      });

      it('firstName should not be empty', async () => {
        postBody.firstName = '';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toContain('firstName should not be empty');
      });

      it('firstName should not be longer than 30 characters', async () => {
        postBody.firstName = 'long first name > 30 characters';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toContain((
          'Firstname must be between 1 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and space ( )'
        ));
      });

      it('firstName should not end with special character', async () => {
        postBody.firstName = 'testUser-';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toContain(
          'Firstname must be between 1 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and space ( )',
        );
      });

      it('firstName should not starts with special character', async () => {
        postBody.firstName = '-testuser';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toContain(
          'Firstname must be between 1 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and space ( )',
        );
      });

      it('userName should not be empty', async () => {
        postBody.userName = '';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'Username must be between 3 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and underscore (_)',
          'userName should not be empty',
        ]);
      });

      it('userName is minimum 3 characters long', async () => {
        postBody.userName = 'Te';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'Username must be between 3 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and underscore (_)',
        ]);
      });

      it('userName is not longer than 30 characters', async () => {
        postBody.userName = 'TestUserTestUserTestUserTestUser';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'Username must be between 3 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and underscore (_)',
        ]);
      });

      it('userName should match pattern', async () => {
        postBody.userName = '_testuser';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'Username must be between 3 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and underscore (_)',
        ]);
      });

      it('email should not be empty', async () => {
        postBody.email = '';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'email must be an email',
          'email should not be empty',
        ]);
      });

      it('email is a proper-form email', async () => {
        postBody.email = 'testusergmail.com';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'email must be an email',
        ]);
      });

      it('password should not be empty', async () => {
        postBody.password = '';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'Password must be at least 8 characters long, contain at least one (1) capital letter, '
          + 'and contain at least one (1) special character.',
          'password should not be empty',
          'passwordConfirmation must match password exactly',
        ]);
      });

      it('password should match pattern', async () => {
        postBody.password = 'testuser123';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'Password must be at least 8 characters long, contain at least one (1) capital letter, '
          + 'and contain at least one (1) special character.',
          'passwordConfirmation must match password exactly',
        ]);
      });

      it('passwordConfirmation should not be empty', async () => {
        postBody.passwordConfirmation = '';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'passwordConfirmation must match password exactly', 'passwordConfirmation should not be empty',
        ]);
      });

      it('password and passwordConfirmation match', async () => {
        postBody.passwordConfirmation = 'TestUser@1234';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'passwordConfirmation must match password exactly',
        ]);
      });

      it('securityQuestion should not be empty', async () => {
        postBody.securityQuestion = '';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'securityQuestion must be longer than or equal to 10 characters',
          'securityQuestion should not be empty',
        ]);
      });

      it('securityQuestion is at least 10 characters long', async () => {
        postBody.securityQuestion = 'Nickname?';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'securityQuestion must be longer than or equal to 10 characters',
        ]);
      });

      it('securityAnswer should not be empty', async () => {
        postBody.securityAnswer = '';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'securityAnswer must be longer than or equal to 2 characters',
          'securityAnswer should not be empty',
        ]);
      });

      it('securityAnswer is at least 2 characters long', async () => {
        postBody.securityAnswer = 'N';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'securityAnswer must be longer than or equal to 2 characters',
        ]);
      });

      it('dob should not be empty', async () => {
        postBody.dob = '';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(['Invalid date of birth', 'You must be at least 18 to register', 'dob should not be empty']);
      });

      it('dob is under age', async () => {
        postBody.dob = DateTime.now().minus({ years: 17, months: 11 }).toISODate();
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(['You must be at least 18 to register']);
      });

      it('dob must be a valid', async () => {
        postBody.dob = '1970-1';
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(['Invalid date of birth']);
      });

      it('dob must be a valid-format iso date', async () => {
        postBody.dob = '03-03-1981';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toEqual(['Invalid date of birth']);
      });

      it('dob must not be invalid', async () => {
        postBody.dob = '1981-02-31';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toEqual(['Invalid date of birth']);
      });
    });

    describe('Existing username or email check, or disallowed username', () => {
      it('returns an error when userName already exists', async () => {
        jest.spyOn(captchaService, 'verifyReCaptchaToken').mockImplementation(() => Promise.resolve({ success: true }));
        let response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.CREATED);

        postBody.email = `different${postBody.email}`;
        response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(['Username is already associated with an existing user.']);
      });

      it('returns an error when email already exists', async () => {
        jest.spyOn(captchaService, 'verifyReCaptchaToken').mockImplementation(() => Promise.resolve({ success: true }));
        let response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.CREATED);

        postBody.userName = `Different${postBody.userName}`;
        response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          'Email address is already associated with an existing user.',
        ]);
      });

      // We're no longer restricting login to beta testers, so this code is commented out.
      // TODO: We can probably remove this, but I'm keeping it here for a little while longer
      // in case we need to bring it back for any reason.
      // it.skip('returns an error when email is not on the beta tester list', async () => {
      //   let response = await request(app.getHttpServer())
      //     .post('/api/v1/users/register')
      //     .send(postBody);
      //   expect(response.status).toEqual(HttpStatus.CREATED);

      //   postBody.userName = `Different${postBody.userName}`;
      //   postBody.email = `not-a-beta-tester-${postBody.email}`;
      //   response = await request(app.getHttpServer())
      //     .get('/api/v1/users/validate-registration-fields')
      //     .query(postBody);
      //   expect(response.status).toEqual(HttpStatus.OK);
      //   expect(response.body).toEqual([
      //     'Only people who requested an invitation are able to register during the sneak preview.',
      //   ]);
      // });

      it('returns an error when userName is on the list of disallowed usernames', async () => {
        await disallowedUsernameService.create({
          username: 'TestUser',
        });

        postBody.email = `different${postBody.email}`;
        const response = await request(app.getHttpServer())
          .get('/api/v1/users/validate-registration-fields')
          .query(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual(['Username is not available.']);
      });
    });
  });
});
