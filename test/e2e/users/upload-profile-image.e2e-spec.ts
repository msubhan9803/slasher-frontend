import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user.schema';
import { createTempFile } from '../../helpers/tempfile-helpers';

describe('Users / Upload Profile image (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
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

  describe('POST /users/upload-profile-image', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
    });
    it('responds with true if file upload successful', async () => {
      await createTempFile(async (tempPath) => {
        const response = await request(app.getHttpServer())
          .post('/users/upload-profile-image')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .attach('file', tempPath)
          .expect(HttpStatus.CREATED);
        expect(response.body).toEqual({ success: true });
      }, { extension: 'png' });
    });

    it('responds expected response when file is not present in request', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/upload-profile-image')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(response.body.message).toContain('File is required');
    });

    it('responds expected response when file is not jpg, jpeg or png', async () => {
      await createTempFile(async (tempPath) => {
        const response = await request(app.getHttpServer())
          .post('/users/upload-profile-image')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .attach('file', tempPath)
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.message).toContain('Validation failed (expected type is /(jpg|jpeg|png)$/)');
      }, { extension: 'zpng' });
    });

    it('responds expected response if file size should not larger than 20MB', async () => {
      await createTempFile(async (tempPath) => {
        const response = await request(app.getHttpServer())
          .post('/users/upload-profile-image')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .attach('file', tempPath)
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
        expect(response.body.message).toContain('Validation failed (expected size is less than 20000000)');
      }, { extension: 'jpg', size: 1024 * 1024 * 21 });
    });
  });
});
