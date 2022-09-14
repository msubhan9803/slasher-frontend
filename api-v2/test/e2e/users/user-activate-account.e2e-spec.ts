import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ActivateAccountDto } from 'src/users/dto/user-activate-account.dto';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';

describe('Users activate account (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;

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

  describe('POST /users/activate-account', () => {
    let user;
    let postBody: ActivateAccountDto;
    beforeEach(async () => {
      const userData = userFactory.build(
        {},
        { transient: { unhashedPassword: 'password' } },
      );
      userData.verification_token = uuidv4();
      user = await usersService.create(userData);
      postBody = {
        email: user.email,
        verification_token: user.verification_token,
      };
    });

    describe('Email and verification_token existence cases', () => {
      it('when email and verification_token both exist, it returns the expected response', async () => {
        const response = await request(app.getHttpServer())
          .post('/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.CREATED);
        expect(response.body).toEqual({ success: true });
      });

      it('when email does not exist, but verification_token does exist, it returns the expected response', async () => {
        postBody.email = 'usertestuser@gmail.com';
        const response = await request(app.getHttpServer())
          .post('/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Token is not valid');
      });

      it('when email does exist, but verification_token does not exist, it returns the expected response', async () => {
        postBody.verification_token = uuidv4();
        const response = await request(app.getHttpServer())
          .post('/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Token is not valid');
      });

      it('when neither email nor verification_token exist, it returns the expected response', async () => {
        postBody.email = 'postBodytestuser@gmail.com';
        postBody.verification_token = uuidv4();
        const response = await request(app.getHttpServer())
          .post('/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Token is not valid');
      });
    });

    describe('Validation', () => {
      it('verification_token should not be empty', async () => {
        postBody.verification_token = '';
        const response = await request(app.getHttpServer())
          .post('/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'verification_token should not be empty',
        );
      });

      it('email should not be empty', async () => {
        postBody.email = '';
        const response = await request(app.getHttpServer())
          .post('/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('email should not be empty');
      });

      it('email is a proper-form email', async () => {
        postBody.email = 'testuserpostbodygmail.com';
        const response = await request(app.getHttpServer())
          .post('/users/activate-account')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'email must be a valid-format email',
        );
      });
    });
  });
});
