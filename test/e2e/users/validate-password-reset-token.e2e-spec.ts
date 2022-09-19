import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';

describe('Users validate password reset token (e2e)', () => {
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

  describe('GET /users/validate-password-reset-token', () => {
    let user;
    beforeEach(async () => {
      const userData = userFactory.build();
      userData.resetPasswordToken = uuidv4();
      user = await usersService.create(userData);
    });
    describe('Email or resetpasswordtoken does exists', () => {
      it('when email or resetpasswordtoken does exists, it returns the expected response', async () => {
        const response = await request(app.getHttpServer())
          .get(
            `/users/validate-password-reset-token?email=${user.email}&resetPasswordToken=${user.resetPasswordToken}`,
          )
          .send();
        expect(response.body).toEqual({ valid: true });
      });

      it('when email is does not exist, but resetpasswordtoken does exists it returns the expected response', async () => {
        user.email = 'usertestuser@gmail.com';
        const response = await request(app.getHttpServer())
          .get(
            `/users/validate-password-reset-token?email=${user.email}&resetPasswordToken=${user.resetPasswordToken}`,
          )
          .send();
        expect(response.body).toEqual({
          valid: false,
        });
      });

      it('when resetpasswordtoken is does not exist, but email does exists it returns the expected response', async () => {
        user.resetPasswordToken = uuidv4();
        const response = await request(app.getHttpServer())
          .get(
            `/users/validate-password-reset-token?email=${user.email}&resetPasswordToken=${user.resetPasswordToken}`,
          )
          .send();
        expect(response.body).toEqual({
          valid: false,
        });
      });

      it('when email and resetpasswordtoken is does not exist, it returns the expected response', async () => {
        user.email = 'usertestuser@gmail.com';
        user.resetPasswordToken = uuidv4();
        const response = await request(app.getHttpServer())
          .get(
            `/users/validate-password-reset-token?email=${user.email}&resetPasswordToken=${user.resetPasswordToken}`,
          )
          .send();
        expect(response.body).toEqual({
          valid: false,
        });
      });
    });

    describe('Validation', () => {
      it('email must be a valid-format email', async () => {
        const email = 'usertestgmail.com';
        const response = await request(app.getHttpServer())
          .get(
            `/users/validate-password-reset-token?email=${email}&resetPasswordToken=${user.resetPasswordToken}`,
          )
          .send();
        expect(response.body.message).toEqual([
          'Not a valid-format email address.',
        ]);
      });

      it('email should not be empty', async () => {
        user.email = '';
        const response = await request(app.getHttpServer())
          .get(
            `/users/validate-password-reset-token?email=${user.email}&resetPasswordToken=${user.resetPasswordToken}`,
          )
          .send();
        expect(response.body.message).toContain('email should not be empty');
      });

      it('resetPasswordToken should not be empty', async () => {
        user.resetPasswordToken = '';
        const response = await request(app.getHttpServer())
          .get(
            `/users/validate-password-reset-token?email=${user.email}&resetPasswordToken=${user.resetPasswordToken}`,
          )
          .send();
        expect(response.body.message).toContain(
          'resetPasswordToken should not be empty',
        );
      });
    });
  });
});
