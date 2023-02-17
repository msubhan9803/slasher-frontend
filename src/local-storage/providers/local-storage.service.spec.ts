import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';
import { AppModule } from '../../app.module';
import { LocalStorageService } from './local-storage.service';
import { createTempFile } from '../../../test/helpers/tempfile-helpers';
import { InvalidPathError } from '../../errors';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';

describe('LocalStorageService', () => {
  let app: INestApplication;
  let localStorageService: LocalStorageService;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    localStorageService = moduleRef.get<LocalStorageService>(LocalStorageService);
    configService = moduleRef.get<ConfigService>(ConfigService);

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(LocalStorageService).toBeDefined();
  });

  describe('#write', () => {
    it('returns the expected to store in respective path', async () => {
      const fileExtension = 'jpg';
      const storedFileName = `${uuidv4()}.${fileExtension}`;
      await createTempFile(async (tempPath) => {
        const file: Express.Multer.File = { path: tempPath } as Express.Multer.File;
        const location = `/profile_test/profile_test_${storedFileName}`;
        localStorageService.write(location, file);

        const localStoragePath = configService.get<string>('LOCAL_STORAGE_DIR');
        expect(existsSync(`${localStoragePath}${location}`)).toBe(true);
      }, { extension: fileExtension });
    });
  });

  describe('#getLocalFilePath', () => {
    it('if given path is exists then it will return that same path', async () => {
      const fileExtension = 'jpg';
      const storedFileName = `${uuidv4()}.${fileExtension}`;
      await createTempFile(async (tempPath) => {
        const file: Express.Multer.File = { path: tempPath } as Express.Multer.File;
        const localStoragePath = configService.get<string>('LOCAL_STORAGE_DIR');
        const location = `/profile_test/profile_test_${storedFileName}`;
        localStorageService.write(location, file);
        expect(localStorageService.getLocalFilePath(location)).toBe(`${localStoragePath}${location}`);
      }, { extension: fileExtension });
    });

    it('if given path is not exists then it will return undefined', async () => {
      const storagePath = '/profile_test/profile_test_1.jpg';
      const filePath = localStorageService.getLocalFilePath(storagePath);

      expect(filePath).toBeUndefined();
    });

    it('rejects invalid paths', async () => {
      // reject location that is outside of the local storage directory
      expect(() => { localStorageService.getLocalFilePath('/../../../something.txt'); }).toThrow(InvalidPathError);

      // reject location that is inside the local storage directory but contains '/../';
      expect(() => { localStorageService.getLocalFilePath('/path/to/file/../something.txt'); }).toThrow(InvalidPathError);

      // reject location that does not start with slash
      expect(() => { localStorageService.getLocalFilePath('/path/to/file/../something.txt'); }).toThrow(InvalidPathError);
    });
  });
});
