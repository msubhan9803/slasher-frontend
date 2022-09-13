import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';

describe('Users / Check User Name (e2e)', () => {
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

  describe('GET /users/check-user-name', () => {
    describe('Check if userName exists and is valid', () => {
      it('when username is valid and does not exist, it returns the expected response', async () => {
        const userName = 'usertestuser';
        const response = await request(app.getHttpServer())
          .get(`/users/check-user-name?userName=${userName}`)
          .send();
        expect(response.body).toEqual({
          exists: false,
        });
      });

      it('when username is valid, but does exists, it returns the expected response', async () => {
        const user = await usersService.create(
          userFactory.build(
            {},
            { transient: { unhashedPassword: 'password' } },
          ),
        );

        const response = await request(app.getHttpServer())
          .get(`/users/check-user-name?userName=${user.userName}`)
          .send();
        expect(response.body).toEqual({
          exists: true,
        });
      });
    });

    describe('Validation', () => {
      it('userName should not be empty', async () => {
        const userName = '';
        const response = await request(app.getHttpServer())
          .get(`/users/check-user-name?userName=${userName}`)
          .send();
        expect(response.body.message).toContain('userName should not be empty');
      });

      it('userName is not longer than 30 characters', async () => {
        const userName = 'TestUserTestUserTestUserTestUser';
        const response = await request(app.getHttpServer())
          .get(`/users/check-user-name?userName=${userName}`)
          .send();
        expect(response.body.message).toContain(
          'userName must be shorter than or equal to 30 characters',
        );
      });
    });
  });
});
