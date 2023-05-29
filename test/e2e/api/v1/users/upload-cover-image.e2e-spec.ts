import * as request from 'supertest';
import * as path from 'path';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { createTempFile } from '../../../../helpers/tempfile-helpers';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

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

  describe('POST /api/v1/users/cover-image', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).post('/api/v1/users/cover-image').expect(HttpStatus.UNAUTHORIZED);
    });

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
        expect(response.body.message).toContain(`Unsupported file type: ${path.basename(tempPath)}`);
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
