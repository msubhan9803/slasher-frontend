import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { ResetPasswordDto } from 'src/users/dto/reset-password.dto';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { clearDatabase } from '../../helpers/mongo-helpers';

describe('Users reset password (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  describe('POST /users/reset-password', () => {
    let user;
    let postBody: ResetPasswordDto;
    beforeEach(async () => {
      const userData = userFactory.build();
      userData.resetPasswordToken = uuidv4();
      user = await usersService.create(userData);
      postBody = {
        email: user.email,
        newPassword: 'User@12345',
        newPasswordConfirmation: 'User@12345',
        resetPasswordToken: user.resetPasswordToken,
      };
    });

    describe('Reset Password', () => {
      it('Password reset successfully, and new password is stored in the db', async () => {
        const response = await request(app.getHttpServer())
          .post('/users/reset-password')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.CREATED);
        expect(
          bcrypt.compareSync(
            postBody.newPassword,
            (await usersService.findByEmail(postBody.email)).password,
          ),
        ).toBe(true);
      });

      it('User does not exists', async () => {
        postBody.email = 'user10@example.com';
        const response = await request(app.getHttpServer())
          .post('/users/reset-password')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      });
    });

    describe('Validation', () => {
      it('resetPasswordToken should not be empty', async () => {
        postBody.resetPasswordToken = '';
        const response = await request(app.getHttpServer())
          .post('/users/reset-password')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'resetPasswordToken should not be empty',
        );
      });

      it('email should not be empty', async () => {
        postBody.email = '';
        const response = await request(app.getHttpServer())
          .post('/users/reset-password')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('email should not be empty');
      });

      it('email is a proper-form email', async () => {
        postBody.email = 'testusergmail.com';
        const response = await request(app.getHttpServer())
          .post('/users/reset-password')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('email must be an email');
      });

      it('newPassword should not be empty', async () => {
        postBody.newPassword = '';
        const response = await request(app.getHttpServer())
          .post('/users/reset-password')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'newPassword should not be empty',
        );
      });

      it('newPassword should match pattern', async () => {
        postBody.newPassword = 'testuser123';
        const response = await request(app.getHttpServer())
          .post('/users/reset-password')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'Password must be at least 8 characters long, contain at least one (1) '
          + 'capital letter, and contain at least one (1) special character.',
        );
      });

      it('newPasswordConfirmation should not be empty', async () => {
        postBody.newPasswordConfirmation = '';
        const response = await request(app.getHttpServer())
          .post('/users/reset-password')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'newPasswordConfirmation should not be empty',
        );
      });

      it('newPassword and newPasswordConfirmation match', async () => {
        postBody.newPasswordConfirmation = 'TestUser@1234';
        const response = await request(app.getHttpServer())
          .post('/users/reset-password')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message[0]).toContain(
          'newPasswordConfirmation must match newPassword exactly',
        );
      });
    });
  });
});
