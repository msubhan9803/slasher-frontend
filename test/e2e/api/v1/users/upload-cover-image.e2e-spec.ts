import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { createTempFile } from '../../../../helpers/tempfile-helpers';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';

describe('Users / Upload Cover image (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
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

  describe('POST /users/cover-image', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
    });
    it('responds with cover photo url if file upload successful', async () => {
      await createTempFile(async (tempPath) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/cover-image')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .attach('file', tempPath)
          .expect(HttpStatus.CREATED);
        expect(response.body).toEqual({ coverPhoto: expect.stringMatching(/\/cover\/cover_[a-f0-9\\-]+\.png/) });
      }, { extension: 'png' });
    });

    it('responds expected response when file is not present in request', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/cover-image')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('File is required');
    });

    it('responds expected response when file is not jpg, jpeg, png, or gif', async () => {
      await createTempFile(async (tempPath) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/cover-image')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .attach('file', tempPath)
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('Invalid file type');
      }, { extension: 'zpng' });
    });

    it('responds expected response if file size should not larger than 20MB', async () => {
      await createTempFile(async (tempPath) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/cover-image')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .attach('file', tempPath)
          .expect(HttpStatus.PAYLOAD_TOO_LARGE);
        expect(response.body.message).toContain('File too large');
      }, { extension: 'jpg', size: 1024 * 1024 * 21 });
    });
  });
});
