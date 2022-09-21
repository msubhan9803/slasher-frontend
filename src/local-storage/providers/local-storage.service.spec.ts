import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../app.module';
import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let app: INestApplication;
  let localStorageService: LocalStorageService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    localStorageService = moduleRef.get<LocalStorageService>(LocalStorageService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    // await connection.dropDatabase();
  });

  it('should be defined', () => {
    expect(LocalStorageService).toBeDefined();
  });

  // describe('#write', () => {
  //   beforeEach(() => {
  //   });

  //   it('returns the expected to store in respective path', async () => {
  //   });
  // });
});
