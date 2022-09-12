import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { ForgotPasswordDto } from '../../../src/users/dto/forgot-password.dto';
import { userFactory } from '../../factories/user.factory';
import { MailService } from '../../../src/services/mail.service';
import { validUuidV4Regex } from '../../helpers/regular-expressions';

describe('Users / Forgot Password (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let mailService: MailService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

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
    await connection.dropDatabase();
  });

  describe('POST /users/forgot-password', () => {
    let email: string;
    let postBody: ForgotPasswordDto;
    beforeEach(() => {
      email = 'someone@example.com';
      postBody = { email: email };
    });

    it('it responds with error message when an invalid-format email supplied', async () => {
      postBody.email = 'invalidemailaddress.com';
      const response = await request(app.getHttpServer())
        .post(`/users/forgot-password`)
        .send(postBody)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual({
        error: 'Bad Request',
        message: ['Not a valid-format email address.'],
        statusCode: 400,
      });
    });

    describe('When a valid-format email address is supplied', () => {
      it('returns { success: true } when the email address IS associated with a registered user', async () => {
        await usersService.create(
          userFactory.build(
            { email: email },
            { transient: { unhashedPassword: 'password' } },
          ),
        );

        jest.spyOn(mailService, 'sendForgotPasswordEmail').mockImplementation();

        const response = await request(app.getHttpServer())
          .post(`/users/forgot-password`)
          .send(postBody)
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          success: true,
        });

        expect(mailService.sendForgotPasswordEmail).toHaveBeenCalledWith(
          email,
          expect.stringMatching(validUuidV4Regex),
        );
      });

      it('returns { success: true } even when the email address is NOT associated with a registered user (to avoid revealing whether email address exists)', async () => {
        const response = await request(app.getHttpServer())
          .post(`/users/forgot-password`)
          .send(postBody)
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          success: true,
        });
      });
    });
  });
});
