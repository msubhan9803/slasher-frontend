import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { UpdateUserDto } from '../../../src/users/dto/update-user-data.dto';
import { User } from '../../../src/schemas/user/user.schema';
import { dropCollections } from '../../helpers/mongo-helpers';

describe('Users / :id (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;

  const sampleUserUpdateObject = {
    firstName: 'user',
    userName: 'TestUser',
    email: 'testuser@gmail.com',
    aboutMe: 'I am a human being',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await dropCollections(connection);

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('PATCH /users/:id', () => {
    let postBody: UpdateUserDto;
    beforeEach(() => {
      postBody = { ...sampleUserUpdateObject };
    });

    describe('Successful update', () => {
      it('update the data successful and it returns the expected response', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/users/${activeUser._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        const userDetails = await usersService.findById(response.body.id);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toMatchObject(postBody);
        expect(userDetails).toMatchObject(postBody);
      });

      it('when the email field is not provided, updated to other fields are still successful '
        + 'and it returns the expected response', async () => {
          const { email, ...restPostBody } = postBody;
          const response = await request(app.getHttpServer())
            .patch(`/users/${activeUser._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send(restPostBody);
          const userDetails = await usersService.findById(response.body.id);
          expect(response.status).toEqual(HttpStatus.OK);
          expect(response.body.email).toBeUndefined();
          expect(userDetails).toMatchObject(restPostBody);
          expect(userDetails.email).toEqual(activeUser.email);
        });

      it('update the userName successful, it returns the expected response', async () => {
        const { firstName, email, ...restPostBody } = postBody;
        const response = await request(app.getHttpServer())
          .patch(`/users/${activeUser._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(restPostBody);
        const userDetails = await usersService.findById(response.body.id);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.firstName).toBeUndefined();
        expect(response.body.email).toBeUndefined();

        expect(userDetails.userName).toEqual(postBody.userName);
        expect(userDetails.email).toEqual(activeUser.email);
        expect(userDetails.firstName).toEqual(activeUser.firstName);
      });
    });

    describe('Validation', () => {
      it('when id is different than token id, it returns the expected response', async () => {
        const userId = '632b3b1e977e7f453003bf61';
        const response = await request(app.getHttpServer())
          .patch(`/users/${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body.message).toContain('You are not allowed to do this action');
      });

      it('firstName is not empty', async () => {
        postBody.firstName = '';
        const response = await request(app.getHttpServer())
          .patch(`/users/${activeUser._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.body.message).toContain(
          'firstName should not be empty',
        );
      });

      it('firstName is not longer than 30 characters', async () => {
        postBody.firstName = 'long first name > 30 characters';
        const response = await request(app.getHttpServer())
          .patch(`/users/${activeUser._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.body.message).toContain(
          'firstName must be shorter than or equal to 30 characters',
        );
      });

      it('userName is minimum 3 characters long', async () => {
        postBody.userName = 'Te';
        const response = await request(app.getHttpServer())
          .patch(`/users/${activeUser._id}`)
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
          .patch(`/users/${activeUser._id}`)
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
          .patch(`/users/${activeUser._id}`)
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
          .patch(`/users/${activeUser._id}`)
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
          .patch(`/users/${activeUser._id}`)
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
          .patch(`/users/${activeUser._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
      });

      it('returns an error when supplied email is different from current and already exists', async () => {
        postBody.email = otherUser.email;
        const response = await request(app.getHttpServer())
          .patch(`/users/${activeUser._id}`)
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
          .patch(`/users/${activeUser._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
      });

      it('aboutMe is not longer than 1000 characters', async () => {
        postBody.aboutMe = new Array(1002).join('z');
        const response = await request(app.getHttpServer())
          .patch(`/users/${activeUser._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'About Me cannot be longer than 1000 characters',
        );
      });
    });
  });
});
