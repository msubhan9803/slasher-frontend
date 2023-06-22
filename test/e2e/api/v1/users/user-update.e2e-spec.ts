/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User, UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { MailService } from '../../../../../src/providers/mail.service';
import { EmailRevertToken, EmailRevertTokenDocument } from '../../../../../src/schemas/emailRevertToken/emailRevertToken.schema';

describe('Users / :id (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let configService: ConfigService;
  let mailService: MailService;
  let emailRevertTokenModel: Model<EmailRevertTokenDocument>;
  let usersModel: Model<UserDocument>;

  const sampleUserUpdateObject = {
    firstName: 'user',
    userName: 'TestUser',
    email: 'testuser@gmail.com',
    aboutMe: 'I am a human being',
    profile_status: ProfileVisibility.Private,
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersModel = moduleRef.get<Model<UserDocument>>(getModelToken(User.name));
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    mailService = moduleRef.get<MailService>(MailService);
    emailRevertTokenModel = moduleRef.get<Model<EmailRevertTokenDocument>>(getModelToken(EmailRevertToken.name));
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

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    user1 = await usersService.create(userFactory.build({
      userName: 'Slasher',
      previousUserName: activeUser.userName,
    }));
  });

  describe('PATCH /api/v1/users/:id', () => {
    let postBody;
    beforeEach(() => {
      postBody = { ...sampleUserUpdateObject };
      jest.spyOn(mailService, 'sendEmailChangeConfirmationEmails').mockImplementation();
    });

    it('requires authentication', async () => {
      const userId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).patch(`/api/v1/users/${userId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Successful update', () => {
      it('update the data successful and it returns the expected response', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: activeUser.id,
          firstName: 'user',
          userName: 'TestUser',
          email: 'User1@Example.com',
          unverifiedNewEmail: 'testuser@gmail.com',
          aboutMe: 'I am a human being',
          profile_status: ProfileVisibility.Private,
        });
      });

      it('performs the expected related actions (send emails, create tokens, etc.) when an email field update happens', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ email: postBody.email });
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: activeUser.id,
          email: 'User1@Example.com',
          unverifiedNewEmail: 'testuser@gmail.com',
        });
        const emailRevertToken = await emailRevertTokenModel.findOne({ userId: activeUser.id });
        expect(emailRevertToken).toBeTruthy();
        const reloadedUser = await usersService.findById(activeUser.id, true);
        expect(mailService.sendEmailChangeConfirmationEmails).toHaveBeenCalledWith(
          activeUser.id,
          activeUser.email,
          postBody.email,
          reloadedUser.emailChangeToken,
          emailRevertToken.value,
        );
      });

      it('when the email field is not provided, updates to other fields are still successful '
        + 'and it returns the expected response', async () => {
          const { email, ...restPostBody } = postBody;
          const response = await request(app.getHttpServer())
            .patch(`/api/v1/users/${activeUser.id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send(restPostBody);
          expect(response.status).toEqual(HttpStatus.OK);
          expect(response.body).toEqual({
            _id: activeUser.id,
            firstName: 'user',
            userName: 'TestUser',
            aboutMe: 'I am a human being',
            profile_status: ProfileVisibility.Private,
          });
        });

      it('update the userName successful, it returns the expected response', async () => {
        const { firstName, email, ...restPostBody } = postBody;
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(restPostBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: activeUser.id,
          userName: 'TestUser',
          aboutMe: 'I am a human being',
          profile_status: ProfileVisibility.Private,
        });
        expect(response.body.firstName).toBeUndefined();
        expect(response.body.email).toBeUndefined();
      });

      it('update the user data successfully when previousUserName is provided', async () => {
        const sampleUserUpdateObject1 = { userName: 'slasher1', previousUserName: activeUser.userName };
        const postBody1 = { ...sampleUserUpdateObject1 };
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody1);
        expect(response.status).toEqual(HttpStatus.OK);

        const updatedUser1 = await usersService.findById(user1.id, true);
        expect(updatedUser1.previousUserName).toBeNull();
      });

      it('when the profile_status is not provided, updates to other fields are still successful', async () => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { profile_status, ...restPostBody } = postBody;
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(restPostBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: activeUser.id,
          firstName: 'user',
          userName: 'TestUser',
          email: 'User1@Example.com',
          unverifiedNewEmail: 'testuser@gmail.com',
          aboutMe: 'I am a human being',
        });

        const user = await usersService.findById(response.body._id, true);
        expect(user.userName).toEqual(postBody.userName);
        expect(user.email).not.toEqual(postBody.email);
        expect(user.unverifiedNewEmail).toEqual(postBody.email);
        expect(user.firstName).toEqual(postBody.firstName);
      });
    });

    describe('Validation', () => {
      it('when id is different than token id, it returns the expected response', async () => {
        const userId = '632b3b1e977e7f453003bf61';
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body.message).toContain('You are not allowed to do this action');
      });

      it('firstName is not empty', async () => {
        postBody.firstName = '';
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.body.message).toContain(
          'firstName should not be empty',
        );
      });

      it('firstName is not longer than 30 characters', async () => {
        postBody.firstName = 'long first name > 30 characters';
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.body.message).toContain(
          'Firstname must be between 1 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and space ( )',
        );
      });

      it('firstName is should not end with special character', async () => {
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
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'Firstname must be between 1 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and space ( )',
        );
      });

      it('userName is minimum 3 characters long', async () => {
        postBody.userName = 'Te';
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.body.message).toContain(
          'Username must be between 3 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and underscore (_)',
        );
      });

      it('userName is not longer than 30 characters', async () => {
        postBody.userName = 'TestUserTestUserTestUserTestUser';
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
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
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'Username must be between 3 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and underscore (_)',
        );
      });

      it('email is a proper-form email', async () => {
        postBody.email = 'testusergmail.com';
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('email must be an email');
      });
    });

    describe('Existing username or email check', () => {
      let otherUser: User;
      const otherUserUsername = 'DifferentUserl';
      const otherUserEmail = 'different@exampe.com';

      beforeEach(async () => {
        otherUser = await usersService.create(userFactory.build({ userName: otherUserUsername, email: otherUserEmail }));
      });

      it('returns an error when supplied userName is different from current and already exists', async () => {
        postBody.userName = otherUser.userName;
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.message).toContain(
          'Username is already associated with an existing user.',
        );
      });

      it("does not return an error when supplied userName is same as user's current userName", async () => {
        postBody.userName = activeUser.userName;
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
      });

      it('returns an error when supplied email is different from current and already exists', async () => {
        postBody.email = otherUser.email;
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.message).toContain(
          'Email address is already associated with an existing user.',
        );
      });

      it("does not return an error when supplied email is same as user's current email", async () => {
        postBody.email = activeUser.email;
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
      });

      it('aboutMe is not longer than 1000 characters', async () => {
        postBody.aboutMe = new Array(1002).join('z');
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'About Me cannot be longer than 1000 characters',
        );
      });

      it('profile_status must be one of the allowed values', async () => {
        postBody.profile_status = 2 as any;
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'profile_status must be one of the following values: 0, 1',
        );
      });

      it("succeeds, and doesn't call usersService.emailAvailable() internally when email field is not in the request body", async () => {
        jest.spyOn(usersService, 'emailAvailable').mockImplementation(() => Promise.resolve(undefined));
        const body = {
          aboutMe: 'I am a human being',
        };
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(body);
        expect(usersService.emailAvailable).toHaveBeenCalledTimes(0);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: activeUser.id,
          aboutMe: 'I am a human being',
        });
      });

      // This test is for ensuring compatibility with the old API, since the old API allowed older
      // users to create accounts with no email address (because they used Facebook for login instead).
      // TODO: When we get to a point where 100% of users in the production database have email
      // address values, we can delete this test.
      it('succeeds, and does not return an error when email is not provided in the request body and '
        + 'at least one user in the database has an undefined email address value', async () => {
          const user = await usersService.create(userFactory.build({ email: 'hello@gmail.com' }));
          await usersModel.findOneAndUpdate({ _id: user._id }, { $unset: { email: 1 } }, { new: true });
          const body = {
            aboutMe: 'I am a human being',
          };
          const response = await request(app.getHttpServer())
            .patch(`/api/v1/users/${activeUser.id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send(body);
          expect(response.status).toEqual(HttpStatus.OK);
          expect(response.body).toEqual({
            _id: activeUser.id,
            aboutMe: 'I am a human being',
          });
        });

      it(
        "succeeds, and doesn't call usersService.userNameAvailable() internally when userName field is not in the request body",
        async () => {
          jest.spyOn(usersService, 'userNameAvailable').mockImplementation(() => Promise.resolve(undefined));
          const body = {
            aboutMe: 'I am a human being',
          };
          const response = await request(app.getHttpServer())
            .patch(`/api/v1/users/${activeUser.id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send(body);
          expect(usersService.userNameAvailable).toHaveBeenCalledTimes(0);
          expect(response.status).toEqual(HttpStatus.OK);
          expect(response.body).toEqual({
            _id: activeUser.id,
            aboutMe: 'I am a human being',
          });
        },
      );
    });
  });
});
