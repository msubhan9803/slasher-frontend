import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../../../../../../src/app.module';
import { UserDocument } from '../../../../../../src/schemas/user/user.schema';
import { EmailChangeConfirmDto } from '../../../../../../src/users/dto/email-change/email-change-confirm.dto';
import { UsersService } from '../../../../../../src/users/providers/users.service';
import { configureAppPrefixAndVersioning } from '../../../../../../src/utils/app-setup-utils';
import { userFactory } from '../../../../../factories/user.factory';
import { rewindAllFactories } from '../../../../../helpers/factory-helpers.ts';
import { clearDatabase } from '../../../../../helpers/mongo-helpers';

describe('Users Email Change Confirm (e2e)', () => {
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

  describe('POST /api/v1/users/email-change/confirm', () => {
    let user: UserDocument;
    let postBody: EmailChangeConfirmDto;
    const oldEmail = 'old@example.com';
    const newEmail = 'new@example.com';
    const emailChangeToken = uuidv4();
    beforeEach(async () => {
      user = await usersService.create(userFactory.build());
      postBody = {
        userId: user.id,
        token: emailChangeToken,
      };
    });

    describe('When a valid token exists for the user', () => {
      beforeEach(async () => {
        await usersService.update(user.id, { email: oldEmail, unverifiedNewEmail: newEmail, emailChangeToken });
      });

      it("Updates the user's email field, clears the unverifiedNewEmail "
        + 'and clears the emailChangeToken, and sends the expected emails', async () => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/users/email-change/confirm')
            .send(postBody);
          expect(response.status).toEqual(HttpStatus.CREATED);
          const userAfterUpdate = await usersService.findById(user.id, true);
          expect(userAfterUpdate.email).toBe(newEmail);
          expect(userAfterUpdate.unverifiedNewEmail).toBeNull();
          expect(userAfterUpdate.emailChangeToken).toBeNull();
          expect(response.body).toEqual({ message: `Your new email address (${newEmail}) has been confirmed.` });
        });
    });

    describe('When the provided token does not exist for the user', () => {
      it('returns the expected response', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/email-change/confirm')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({ statusCode: HttpStatus.BAD_REQUEST, message: 'Invalid token.' });
      });
    });

    describe('Validation', () => {
      it('userId should not be empty', async () => {
        postBody.userId = '';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/email-change/confirm')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId should not be empty',
        );
      });

      it('userId should be a valid MongoDB id', async () => {
        postBody.userId = 'abc';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/email-change/confirm')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId must be a mongodb id',
        );
      });

      it('token should not be empty', async () => {
        postBody.token = 'abc';
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/email-change/confirm')
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'Invalid token',
        );
      });
    });
  });
});
