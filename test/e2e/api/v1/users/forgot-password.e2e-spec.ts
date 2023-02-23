import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { ForgotPasswordDto } from '../../../../../src/users/dto/forgot-password.dto';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { MailService } from '../../../../../src/providers/mail.service';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { validUuidV4Regex } from '../../../../helpers/regular-expressions';
import { userFactory } from '../../../../factories/user.factory';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';

describe('Users / Forgot Password (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let mailService: MailService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    mailService = moduleRef.get<MailService>(MailService);

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
  });

  describe('POST /api/v1/users/forgot-password', () => {
    let email: string;
    let postBody: ForgotPasswordDto;
    beforeEach(async () => {
      email = 'someone@example.com';
      postBody = { email };
      await usersService.create(
        userFactory.build({ email }),
      );
    });

    it('responds with error message when an invalid-format email supplied', async () => {
      postBody.email = 'invalidemailaddress.com';
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/forgot-password')
        .send(postBody)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual({
        error: 'Bad Request',
        message: ['Not a valid-format email address.'],
        statusCode: 400,
      });
    });

    describe('When a valid-format email address is supplied', () => {
      it('returns { success: true } and sends an email when the email address IS associated with a registered user', async () => {
        jest.spyOn(mailService, 'sendForgotPasswordEmail').mockImplementation();

        const response = await request(app.getHttpServer())
          .post('/api/v1/users/forgot-password')
          .send(postBody)
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          success: true,
        });

        const foundUser = await usersService.findByEmail(email);
        expect(foundUser.resetPasswordToken).toMatch(validUuidV4Regex);
        expect(mailService.sendForgotPasswordEmail).toHaveBeenCalledWith(
          email,
          foundUser.resetPasswordToken,
        );
      });

      // Test below makes sure we avoid revealing whether email address exists when user submits
      // a forgot-password recovery attempt.
      it('returns { success: true } even when the email address is NOT associated with a registered user, '
        + 'but does not send an email', async () => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/users/forgot-password')
            .send(postBody)
            .expect(HttpStatus.OK);
          expect(response.body).toEqual({
            success: true,
          });
        });
    });
  });
});
