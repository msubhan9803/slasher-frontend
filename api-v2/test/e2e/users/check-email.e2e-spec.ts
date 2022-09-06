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

  describe('POST /users/checkEmail/:email', () => {
    describe('Check email exits', () => {
      it('email must be an email', async () => {
        const postParams = {
          email: 'usertestgmail.com',
        };
        const response = await request(app.getHttpServer())
          .post(`/users/checkEmail/${postParams.email}`)
          .send();
        expect(response.body).toEqual({
          message: 'email must be an email',
          exists: false,
          valid: false,
        });
      });

      it('Email is not exists', async () => {
        const sampleUserEmailObject = {
          email: 'usertestuser@gmail.com',
        };
        const response = await request(app.getHttpServer())
          .post(`/users/checkEmail/${sampleUserEmailObject.email}`)
          .send();
        expect(response.body).toEqual({
          message: 'Email is not exists',
          exists: false,
          valid: true,
        });
      });

      it('Email is already exists', async () => {
        const user = await usersService.create(
          userFactory.build(
            {},
            { transient: { unhashedPassword: 'password' } },
          ),
        );

        const response = await request(app.getHttpServer())
          .post(`/users/checkEmail/${user.email}`)
          .send();
        expect(response.body).toEqual({
          message: 'Email is already exists',
          exists: true,
          valid: true,
        });
      });
    });
  });
});
