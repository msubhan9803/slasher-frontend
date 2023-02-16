import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { userFactory } from '../../../../factories/user.factory';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { clearDatabase } from '../../../../helpers/mongo-helpers';

describe('Users / Check Email (e2e)', () => {
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
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  describe('GET /api/v1/users/check-email', () => {
    it('responds with error message when an invalid-format email supplied', async () => {
      const email = 'usertestgmail.com';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/check-email?email=${email}`)
        .send();
      expect(response.body).toEqual({
        error: 'Bad Request',
        message: ['Not a valid-format email address.'],
        statusCode: 400,
      });
    });

    describe('When a valid-format email address is supplied', () => {
      it('returns { exists: false } when the email address is NOT associated with a registered user', async () => {
        const email = 'usertestuser@gmail.com';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/check-email?email=${email}`)
          .send();
        expect(response.body).toEqual({
          exists: false,
        });
      });

      it('returns { exists: true } when the email address IS associated with a registered user', async () => {
        const user = await usersService.create(
          userFactory.build(),
        );

        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/check-email?email=${user.email}`)
          .send();
        expect(response.body).toEqual({
          exists: true,
        });
      });
    });
  });
});
