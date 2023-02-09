import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { readdirSync } from 'fs';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { createTempFile } from '../../helpers/tempfile-helpers';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { MAXIMUM_IMAGE_UPLOAD_SIZE } from '../../../src/constants';
import { clearDatabase } from '../../helpers/mongo-helpers';

describe('Users / Upload Profile image (e2e)', () => {
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  describe('POST /users/upload-profile-image', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
    });
    it('there should be no files in `UPLOAD_DIR` (other than one .keep file)', async () => {
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('responds with true if file upload successful and ensure temp file is removed', async () => {
      await createTempFile(async (tempPath) => {
        const response = await request(app.getHttpServer())
          .post('/users/upload-profile-image')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .attach('file', tempPath)
          .expect(HttpStatus.CREATED);
        expect(response.body).toEqual({ success: true });
        expect((await usersService.findById(activeUser.id)).profilePic).toMatch(/\/profile\/profile_[a-f0-9\\-]+\.png/);
      }, { extension: 'png' });

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('responds expected response when file is not present in request', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/upload-profile-image')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('File is required');
    });

    it('responds with expected response when file is not jpg, jpeg, png, or gif and ensures that temp file is removed', async () => {
      await createTempFile(async (tempPath) => {
        const response = await request(app.getHttpServer())
          .post('/users/upload-profile-image')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .attach('file', tempPath)
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('Invalid file type');
      }, { extension: 'zpng' });

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('responds expected response if file size should not larger than 20MB and ensure temp file is removed', async () => {
      await createTempFile(async (tempPath) => {
        const response = await request(app.getHttpServer())
          .post('/users/upload-profile-image')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .attach('file', tempPath)
          .expect(HttpStatus.PAYLOAD_TOO_LARGE);
        expect(response.body.message).toContain('File too large');
      }, { extension: 'jpg', size: 1024 * 1024 * 21 });

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });
  });
});
