import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { ReadStream } from 'fs';
import { HeadObjectCommandOutput } from '@aws-sdk/client-s3';
import { AppModule } from '../../app.module';
import { createTempFile } from '../../../test/helpers/tempfile-helpers';
import { S3StorageService } from './s3-storage.service';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { S3FileExistsError } from '../../errors';

describe('S3StorageService', () => {
  let app: INestApplication;
  let s3StorageService: S3StorageService;
  let configService: ConfigService;
  let s3HeadRequest404Error;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    s3StorageService = moduleRef.get<S3StorageService>(S3StorageService);
    configService = moduleRef.get<ConfigService>(ConfigService);

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  beforeEach(() => {
    s3HeadRequest404Error = new Error();
    (s3HeadRequest404Error as any).$metadata = { httpStatusCode: 404 };
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
      jest.spyOn(s3StorageService, 's3HeadRequestForObject').mockImplementation(() => Promise.reject(s3HeadRequest404Error));

      await createTempFile(async (tempPath) => {
        const file: Express.Multer.File = { path: tempPath } as Express.Multer.File;
        const location = `/profile_test/profile_test_${storedFileName}`;
        await s3StorageService.write(location, file);
        expect(s3StorageService.s3PutObject).toHaveBeenCalledWith({
          Bucket: configService.get<string>('S3_BUCKET'),
          Key: location.substring(1),
          Body: expect.any(ReadStream),
          ContentType: 'image/jpeg',
        });
      }, { extension: fileExtension });
    });

    it("throws an exception when the passed-in file can't be found on the filesystem", async () => {
      const file: Express.Multer.File = { path: '/no/file/exists/here' } as Express.Multer.File;
      const location = `/test/${uuidv4()}.jpg`;
      await expect(s3StorageService.write(location, file))
        .rejects
        .toThrow('Uploaded file not found at upload path: /no/file/exists/here');
    });
  });

  describe('#s3ObjectExists', () => {
    it('returns true when an object exists', async () => {
      jest.spyOn(s3StorageService, 's3HeadRequestForObject').mockImplementation(() => Promise.resolve({} as HeadObjectCommandOutput));

      const location = '/profile_test/profile_test_abcde';
      const exists = await s3StorageService.s3ObjectExists(location);
      expect(s3StorageService.s3HeadRequestForObject).toHaveBeenCalledWith({
        Bucket: configService.get<string>('S3_BUCKET'),
        Key: location.substring(1),
      });
      expect(exists).toBeTruthy();
    });

    it('returns false when an object does not exist', async () => {
      jest.spyOn(s3StorageService, 's3HeadRequestForObject').mockImplementation(() => Promise.reject(s3HeadRequest404Error));

      const location = '/profile_test/profile_test_abcde';
      const exists = await s3StorageService.s3ObjectExists(location);
      expect(s3StorageService.s3HeadRequestForObject).toHaveBeenCalledWith({
        Bucket: configService.get<string>('S3_BUCKET'),
        Key: location.substring(1),
      });
      expect(exists).toBeFalsy();
    });
  });

  it('throws an exception when an S3 object already exists at the specified location', async () => {
    const fileExtension = 'jpg';
    const storedFileName = `${uuidv4()}.${fileExtension}`;
    jest.spyOn(s3StorageService, 's3PutObject').mockImplementation(() => Promise.resolve(undefined));
    jest.spyOn(s3StorageService, 's3HeadRequestForObject').mockImplementation(() => Promise.resolve({} as HeadObjectCommandOutput));

    await createTempFile(async (tempPath) => {
      const file: Express.Multer.File = { path: tempPath } as Express.Multer.File;
      const location = `/profile_test/profile_test_${storedFileName}`;
      await expect(s3StorageService.write(location, file))
        .rejects
        .toThrow(S3FileExistsError);
      expect(s3StorageService.s3PutObject).not.toHaveBeenCalled();
    }, { extension: fileExtension });
  });
});
