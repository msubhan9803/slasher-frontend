import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { StorageLocationService } from './storage-location.service';

describe('StorageLocationService', () => {
  let app: INestApplication;
  let storageLocationService: StorageLocationService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    storageLocationService = moduleRef.get<StorageLocationService>(StorageLocationService);

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(StorageLocationService).toBeDefined();
  });

  describe('#generateNewStorageLocationFor', () => {
    it('generates the expected-format value', () => {
      jest.spyOn(storageLocationService, 'getStorageLocationGeneratorPrefix').mockImplementation(() => '/custom-prefix/');
      expect(storageLocationService.generateNewStorageLocationFor('sometype', 'somefilename.png')).toBe(
        '/custom-prefix/sometype/sometype_somefilename.png',
      );
    });
  });
});
