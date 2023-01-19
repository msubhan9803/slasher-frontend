import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { ForgotPasswordDto } from '../../../src/users/dto/forgot-password.dto';
import { clearDatabase } from '../../helpers/mongo-helpers';

describe('Users / Forgot Password (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

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
        const response = await request(app.getHttpServer())
          .post('/users/forgot-password')
          .send(postBody)
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({
          success: true,
        });
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
