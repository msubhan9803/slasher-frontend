import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';

describe('Users / Check User Name (e2e)', () => {
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
  });

  describe('GET /api/v1/users/check-user-name', () => {
    describe('Check if userName exists and is valid', () => {
      it('when username is valid and does not exist, it returns the expected response', async () => {
        const userName = 'usertestuser';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/check-user-name?userName=${userName}`)
          .send();
        expect(response.body).toEqual({
          exists: false,
        });
      });

      it('when username is valid, but does exists, it returns the expected response', async () => {
        const user = await usersService.create(
          userFactory.build(),
        );

        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/check-user-name?userName=${user.userName}`)
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
          .get(`/api/v1/users/check-user-name?userName=${userName}`)
          .send();
        expect(response.body.message).toContain('userName should not be empty');
      });

      it('userName is minimum 3 characters long', async () => {
        const userName = 'Te';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/check-user-name?userName=${userName}`)
          .send();
        expect(response.body.message).toContain(
          'Username must be between 3 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and underscore (_)',
        );
      });

      it('userName is not longer than 30 characters', async () => {
        const userName = 'TestUserTestUserTestUserTestUser';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/check-user-name?userName=${userName}`)
          .send();
        expect(response.body.message).toContain(
          'Username must be between 3 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and underscore (_)',
        );
      });

      it('userName should match pattern', async () => {
        const userName = '_testuser';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/check-user-name?userName=${userName}`)
          .send();
        expect(response.body.message).toContain(
          'Username must be between 3 and 30 characters, can only include letters/numbers/special characters, '
          + 'and cannot begin or end with a special character.  Allowed special characters: period (.), hyphen (-), and underscore (_)',
        );
      });
    });
  });
});
