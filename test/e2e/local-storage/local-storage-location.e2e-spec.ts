import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../../../src/app.module';
import { createTempFile } from '../../helpers/tempfile-helpers';
import { LocalStorageService } from '../../../src/local-storage/providers/local-storage.service';
import { clearDatabase } from '../../helpers/mongo-helpers';

describe('Local-Storage / Get File (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let localStorageService: LocalStorageService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    localStorageService = moduleRef.get<LocalStorageService>(LocalStorageService);
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

  describe('GET /local-storage/:location', () => {
    it('does not require authentication, and responds with file if give file path exists', async () => {
      const fileExtension = 'jpg';
      const storedFileName = `${uuidv4()}.${fileExtension}`;
      const location = `/profile_test/profile_test_${storedFileName}`;

      await createTempFile(async (tempPath) => {
        const file: Express.Multer.File = { path: tempPath } as Express.Multer.File;
        localStorageService.write(location, file);
      }, { extension: 'png' });

      await request(app.getHttpServer())
        .get(`/local-storage${location}`)
        .send()
        .expect(HttpStatus.OK);
    });

    it('responds expected response when file path is not present at requested path', async () => {
      const storagePath = 'profile_test/profile_test_1.jpg';

      const response = await request(app.getHttpServer())
        .get(`/local-storage/${storagePath}`)
        .send()
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.message).toContain('File not found');
    });
  });
});
