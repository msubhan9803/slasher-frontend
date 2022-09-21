import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user.schema';
import { UpdateUserDto } from '../../../src/users/dto/update-user-data.dto';

describe('Users / :id (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;

  const sampleUserRegisterObject = {
    firstName: 'user',
    userName: 'TestUser',
    email: 'testuser@gmail.com',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

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
    await connection.dropDatabase();

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('PATCH /users/:id', () => {
    let postBody: UpdateUserDto;
    beforeEach(() => {
      postBody = { ...sampleUserRegisterObject };
    });

    describe('Successful update', () => {
      it('when id is different than token id, it returns the expected response', async () => {
        const userId = '632b3b1e977e7f453003bf61';
        const response = await request(app.getHttpServer())
          .patch(`/users/${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);

        expect(response.status).toBe(HttpStatus.FORBIDDEN);
        expect(response.body.message).toContain('You are not allowed to do this action');
      });

      it('update the data successful and it returns the expected response', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/users/${activeUser._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.firstName).toEqual(postBody.firstName);
        expect(response.body.userName).toEqual(postBody.userName);
        expect(response.body.email).toEqual(postBody.email);
      });

      it('update the firstName and userName successful, it returns the expected response', async () => {
        const { email, ...restPostBody } = postBody;
        const response = await request(app.getHttpServer())
          .patch(`/users/${activeUser._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(restPostBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.firstName).toEqual(restPostBody.firstName);
        expect(response.body.userName).toEqual(restPostBody.userName);
      });

      it('update the userName successful, it returns the expected response', async () => {
        const { firstName, email, ...restPostBody } = postBody;
        const response = await request(app.getHttpServer())
          .patch(`/users/${activeUser._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(restPostBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.userName).toEqual(postBody.userName);
      });
    });

    describe('Validation', () => {
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
  });
});
