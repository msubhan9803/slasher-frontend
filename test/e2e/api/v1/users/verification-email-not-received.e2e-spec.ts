import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { MailService } from '../../../../../src/providers/mail.service';
import { VerificationEmailNotReceivedDto } from '../../../../../src/users/dto/verification-email-not-recevied.dto';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Users / Verification Email Not Received (e2e)', () => {
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

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
  });

  describe('POST /api/v1/users/verification-email-not-received', () => {
    let email: string;
    let postBody: VerificationEmailNotReceivedDto;
    beforeEach(() => {
      email = 'someone@example.com';
      postBody = { email };
    });

    it('responds with error message when an invalid-format email supplied', async () => {
      postBody.email = 'invalidemailaddress.com';
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/verification-email-not-received')
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
        const user = await usersService.create(
          userFactory.build({ email }),
        );
        user.verification_token = uuidv4();
        await user.save();

        jest.spyOn(mailService, 'sendVerificationEmail').mockImplementation();

        const response = await request(app.getHttpServer())
          .post('/api/v1/users/verification-email-not-received')
          .send(postBody)
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          success: true,
        });

        expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
          email,
          user.verification_token,
        );
      });

      // Test below makes sure we avoid revealing whether email address exists when user submits
      // a verification-email-not-received recovery attempt.
      it('returns { success: true } even when the email address is NOT associated with a registered user, '
        + 'but does not send an email', async () => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/users/verification-email-not-received')
            .send(postBody)
            .expect(HttpStatus.OK);
          expect(response.body).toEqual({
            success: true,
          });
        });
    });
  });
});
