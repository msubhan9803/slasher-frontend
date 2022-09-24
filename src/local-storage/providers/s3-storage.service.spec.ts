import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { ReadStream } from 'fs';
import { AppModule } from '../../app.module';
import { createTempFile } from '../../../test/helpers/tempfile-helpers';
import { S3StorageService } from './s3-storage.service';

describe('S3StorageService', () => {
  let app: INestApplication;
  let s3StorageService: S3StorageService;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    s3StorageService = moduleRef.get<S3StorageService>(S3StorageService);
    configService = moduleRef.get<ConfigService>(ConfigService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(S3StorageService).toBeDefined();
  });

  describe('#write', () => {
    it('passes the correct arguments to #s3PutObject', async () => {
      const fileExtension = 'jpg';
      const storedFileName = `${uuidv4()}.${fileExtension}`;
      jest.spyOn(s3StorageService, 's3PutObject').mockImplementation(() => Promise.resolve(undefined));
      await createTempFile(async (tempPath) => {
        const file: Express.Multer.File = { path: tempPath } as Express.Multer.File;
        const storagePath = '/profile_test/';
        const fileName = `profile_test_${storedFileName}`;
        await s3StorageService.write(storagePath, fileName, file);
        expect(s3StorageService.s3PutObject).toHaveBeenCalledWith({
          Bucket: configService.get<string>('S3_BUCKET'),
          Key: `profile_test/profile_test_${storedFileName}`,
          Body: expect.any(ReadStream),
          ContentType: 'image/jpeg',
        });
      }, { extension: fileExtension });
    });

    it("throws an exception when the passed-in file can't be found on the filesystem", async () => {
      const file: Express.Multer.File = { path: '/no/file/exists/here' } as Express.Multer.File;
      const storagePath = '/test/';
      const fileName = `${uuidv4()}.jpg`;
      await expect(s3StorageService.write(storagePath, fileName, file))
        .rejects
        .toThrow('Uploaded file not found at upload path: /no/file/exists/here');
    });
  });
});
