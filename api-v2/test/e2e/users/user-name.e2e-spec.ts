import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Users Name (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  const sampleUserRegisterObject = {
    firstName: 'user',
    userName: 'TestUser',
    email: 'testuser@gmail.com',
    password: 'TestUser@123',
    passwordConfirmation: 'TestUser@123',
    securityQuestion: 'What is favourite food?',
    securityAnswer: 'Pizza',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
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

  describe('POST /users/checkUserName/:userName', () => {
    describe('Check userName exits', () => {
      it('userName is not longer than 30 characters', async () => {
        const postParams = {
          userName: 'TestUserTestUserTestUserTestUser',
        };
        const response = await request(app.getHttpServer())
          .post(`/users/checkUserName/${postParams.userName}`)
          .send();
        expect(response.body).toEqual({
          message: 'userName is not longer than 30 characters',
          exists: false,
          valid: false,
        });
      });

      it('userName is not exists', async () => {
        const sampleUserNameObject = {
          userName: 'usertestuser',
        };
        const response = await request(app.getHttpServer())
          .post(`/users/checkUserName/${sampleUserNameObject.userName}`)
          .send();
        expect(response.body).toEqual({
          message: 'userName is not exists',
          exists: false,
          valid: true,
        });
      });

      it('userName is already exists', async () => {
        const postBody = {
          ...sampleUserRegisterObject,
        };
        await request(app.getHttpServer())
          .post('/users/register')
          .send(postBody);
        const userNameObject = {
          userName: 'TestUser',
        };
        const response = await request(app.getHttpServer())
          .post(`/users/checkUserName/${userNameObject.userName}`)
          .send();
        expect(response.body).toEqual({
          message: 'userName is already exists',
          exists: true,
          valid: true,
        });
      });
    });
  });
});
