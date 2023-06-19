/* eslint-disable jest/no-commented-out-tests */
/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { MailService } from '../../../../../src/providers/mail.service';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { DisallowedUsernameService } from '../../../../../src/disallowedUsername/providers/disallowed-username.service';
import { validUuidV4Regex } from '../../../../helpers/regular-expressions';
import { UserSettingsService } from '../../../../../src/settings/providers/user-settings.service';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { BetaTestersService } from '../../../../../src/beta-tester/providers/beta-testers.service';
import { betaTesterFactory } from '../../../../factories/beta-tester.factory';

describe('Users / Register (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let mailService: MailService;
  let disallowedUsernameService: DisallowedUsernameService;
  let userSettingsService: UserSettingsService;
  let betaTestersService: BetaTestersService;

  const sampleUserRegisterObject = {
    firstName: 'user',
    userName: 'TestUser',
    email: 'testuser@gmail.com',
    password: 'TestUser@123',
    passwordConfirmation: 'TestUser@123',
    securityQuestion: 'Name of your first pet?',
    securityAnswer: 'tom',
    dob: DateTime.now().minus({ years: 18 }).toISODate(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    mailService = moduleRef.get<MailService>(MailService);
    disallowedUsernameService = moduleRef.get<DisallowedUsernameService>(DisallowedUsernameService);
    userSettingsService = moduleRef.get<UserSettingsService>(UserSettingsService);
    betaTestersService = moduleRef.get<BetaTestersService>(BetaTestersService);

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
        { name: 'TestUser', email: 'testuser@gmail.com' },
      ),
    );
    await betaTestersService.create(
      betaTesterFactory.build(
        { name: 'TestUser', email: 'differenttestuser@gmail.com' },
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

    describe('Successful Registration', () => {
      it('can successfully register with given user data', async () => {
        jest.spyOn(mailService, 'sendVerificationEmail').mockImplementation();
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody)
          .expect(HttpStatus.CREATED);
        expect(response.body).toEqual({
          id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        });
        // Verify that the correct fields were set on the created user object
        const registeredUser = await usersService.findById(response.body.id, false);
        expect(await userSettingsService.findByUserId(response.body.id)).not.toBeNull();
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
        expect(registeredUser.verification_token).toMatch(validUuidV4Regex);
        expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
          registeredUser.email,
          registeredUser.id,
          registeredUser.verification_token,
        );
      });

      it('sets the registrationIp', async () => {
        jest.spyOn(mailService, 'sendVerificationEmail').mockImplementation();
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody)
          .expect(HttpStatus.CREATED);
        const registeredUser = await usersService.findById(response.body.id, false);

        expect(registeredUser.registrationIp.length).toBeGreaterThan(4); // test for presence of IP value
      });
    });

    describe('Validation', () => {
      it('firstName should not be empty', async () => {
        postBody.firstName = '';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'firstName should not be empty',
        );
      });

      it('firstName should not be longer than 30 characters', async () => {
        postBody.firstName = 'long first name > 30 characters';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'Firstname must be between 1 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and space ( )',
        );
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
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'Firstname must be between 1 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and space ( )',
        );
      });

      it('userName should not be empty', async () => {
        postBody.userName = '';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('userName should not be empty');
      });

      it('userName is minimum 3 characters long', async () => {
        postBody.userName = 'Te';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.body.message).toContain(
          'Username must be between 3 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and underscore (_)',
        );
      });

      it('userName is not longer than 30 characters', async () => {
        postBody.userName = 'TestUserTestUserTestUserTestUser';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'Username must be between 3 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and underscore (_)',
        );
      });

      it('userName should match pattern', async () => {
        postBody.userName = '_testuser';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'Username must be between 3 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and underscore (_)',
        );
      });

      it('email should not be empty', async () => {
        postBody.email = '';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('email should not be empty');
      });

      it('email is a proper-form email', async () => {
        postBody.email = 'testusergmail.com';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('email must be an email');
      });

      it('password should not be empty', async () => {
        postBody.password = '';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('password should not be empty');
      });

      it('password should match pattern', async () => {
        postBody.password = 'testuser123';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
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
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'passwordConfirmation should not be empty',
        );
      });

      it('password and passwordConfirmation match', async () => {
        postBody.passwordConfirmation = 'TestUser@1234';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'passwordConfirmation must match password exactly',
        );
      });

      it('securityQuestion should not be empty', async () => {
        postBody.securityQuestion = '';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'securityQuestion should not be empty',
        );
      });

      it('securityQuestion is at least 10 characters long', async () => {
        postBody.securityQuestion = 'Nickname?';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'securityQuestion must be longer than or equal to 10 characters',
        );
      });

      it('securityAnswer should not be empty', async () => {
        postBody.securityAnswer = '';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'securityAnswer should not be empty',
        );
      });

      it('securityAnswer is at least 2 characters long', async () => {
        postBody.securityAnswer = 'k';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'securityAnswer must be longer than or equal to 2 characters',
        );
      });

      it('dob should not be empty', async () => {
        postBody.dob = '';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('dob should not be empty');
      });

      it('dob is under age', async () => {
        postBody.dob = DateTime.now().minus({ years: 17, months: 11 }).toISODate();
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('You must be at least 18 to register');
      });

      it('dob must be a valid', async () => {
        postBody.dob = '1970-1';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('Invalid date of birth');
      });

      it('dob must be a valid-format iso date', async () => {
        postBody.dob = '03-03-1981';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('Invalid date of birth');
      });

      it('dob must not be invalid', async () => {
        postBody.dob = '1981-02-31';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('Invalid date of birth');
      });
    });

    describe('Existing username or email check', () => {
      it('returns an error when userName already exists', async () => {
        let response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.CREATED);

        postBody.email = `different${postBody.email}`;
        response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.message).toContain(
          'Username is already associated with an existing user.',
        );
      });

      it('returns an error when email already exists', async () => {
        let response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.CREATED);

        postBody.userName = `Different${postBody.userName}`;
        response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.message).toContain(
          'Email address is already associated with an existing user.',
        );
      });

      it('returns an error when user submits a database-backed disallowed username', async () => {
        await disallowedUsernameService.create({
          username: 'TeStUsEr',
        });
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.message).toContain(
          'Username is not available',
        );
      });

      it('returns an error when user submits a hard-coded disallowed username', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/register')
          .send({ ...postBody, userName: 'pages' });
        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.message).toContain(
          'Username is not available',
        );
      });
    });

    // We're no longer restricting login to beta testers, so this code is commented out.
    // TODO: We can probably remove this, but I'm keeping it here for a little while longer
    // in case we need to bring it back for any reason.
    // describe('A user whose email is not in the BetaTesters collection', () => {
    //   it('receives an error message when attempting to register', async () => {
    //     jest.spyOn(mailService, 'sendVerificationEmail').mockImplementation();
    //     postBody.email = 'slasherusertest@gmail.com';
    //     const response = await request(app.getHttpServer())
    //       .post('/api/v1/users/register')
    //       .send(postBody)
    //       .expect(HttpStatus.BAD_REQUEST);
    //     expect(response.body).toEqual({
    //       statusCode: 400,
    //       message: 'Only people who requested an invitation are able to register during the sneak preview.',
    //     });
    //   });

    //   it('when email is already exists in betatester than expected response', async () => {
    //     jest.spyOn(mailService, 'sendVerificationEmail').mockImplementation();
    //     const response = await request(app.getHttpServer())
    //       .post('/api/v1/users/register')
    //       .send(postBody)
    //       .expect(HttpStatus.CREATED);
    //     expect(response.body).toEqual({
    //       id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
    //     });
    //   });
    // });
  });
});
