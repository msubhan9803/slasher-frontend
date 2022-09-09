import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { userFactory } from '../../factories/user.factory';
import { UsersService } from '../../../src/users/providers/users.service';

describe('Users Check Email (e2e)', () => {
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

  describe('GET /users/check-email', () => {
    describe('Check email exits', () => {
      it('email must be a valid-format email', async () => {
        const email = 'usertestgmail.com';
        const response = await request(app.getHttpServer())
          .get(`/users/check-email?email=${email}`)
          .send();
        expect(response.body.error).toEqual('Bad Request');
        expect(response.body.message).toEqual([
          'Not a valid-format email address.',
        ]);
      });

      it('returns expected response when email does NOT exist', async () => {
        const email = 'usertestuser@gmail.com';
        const response = await request(app.getHttpServer())
          .get(`/users/check-email?email=${email}`)
          .send();
        expect(response.body).toEqual({
          exists: false,
        });
      });

      it('returns expected response when email DOES exist', async () => {
        const user = await usersService.create(
          userFactory.build(
            {},
            { transient: { unhashedPassword: 'password' } },
          ),
        );

        const response = await request(app.getHttpServer())
          .get(`/users/check-email?email=${user.email}`)
          .send();
        expect(response.body).toEqual({
          exists: true,
        });
      });
    });
  });
});
