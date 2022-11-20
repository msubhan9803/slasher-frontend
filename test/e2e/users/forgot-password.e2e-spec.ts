import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { ForgotPasswordDto } from '../../../src/users/dto/forgot-password.dto';
import { userFactory } from '../../factories/user.factory';
import { MailService } from '../../../src/providers/mail.service';
import { validUuidV4Regex } from '../../helpers/regular-expressions';
import { dropCollections } from '../../helpers/mongo-helpers';

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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await dropCollections(connection);
  });

  describe('POST /users/forgot-password', () => {
    let email: string;
    let postBody: ForgotPasswordDto;
    beforeEach(() => {
      email = 'someone@example.com';
      postBody = { email };
    });

    it('responds with error message when an invalid-format email supplied', async () => {
      postBody.email = 'invalidemailaddress.com';
      const response = await request(app.getHttpServer())
        .post('/users/forgot-password')
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
        let user = await usersService.create(
          userFactory.build({ email }),
        );

        jest.spyOn(mailService, 'sendForgotPasswordEmail').mockImplementation();

        const response = await request(app.getHttpServer())
          .post('/users/forgot-password')
          .send(postBody)
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          success: true,
        });

        user = await usersService.findById(user._id); // reload user from db data
        expect(user.resetPasswordToken).toMatch(validUuidV4Regex);

        expect(mailService.sendForgotPasswordEmail).toHaveBeenCalledWith(
          email,
          user.resetPasswordToken,
        );
      });

      // Test below makes sure we avoid revealing whether email address exists when user submits
      // a forgot-password recovery attempt.
      it('returns { success: true } even when the email address is NOT associated with a registered user, '
        + 'but does not send an email', async () => {
          const response = await request(app.getHttpServer())
            .post('/users/forgot-password')
            .send(postBody)
            .expect(HttpStatus.OK);
          expect(response.body).toEqual({
            success: true,
          });
        });
    });
  });
});
