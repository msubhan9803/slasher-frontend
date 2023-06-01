/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { clearDatabase } from '../../test/helpers/mongo-helpers';
import { AppModule } from '../app.module';
import { configureAppPrefixAndVersioning } from './app-setup-utils';
import { validateEnv } from './env-validation';
import { rewindAllFactories } from '../../test/helpers/factory-helpers.ts';

describe('Env validation for ConfigService', () => {
  let app: INestApplication;
  let connection: Connection;
  const baseConfig = {
    CRON_ENABLED: true,
    UPLOAD_DIR: '/path/to/upload/dir',
  } as any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

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

  describe('#validateEnv', () => {
    describe('CRON_ENABLED', () => {
      it('parses as expected', () => {
        expect(validateEnv({ ...baseConfig, CRON_ENABLED: 'true' }).CRON_ENABLED).toBe(true);
        expect(validateEnv({ ...baseConfig, CRON_ENABLED: 'false' }).CRON_ENABLED).toBe(false);
        expect(validateEnv({ ...baseConfig, CRON_ENABLED: 'non-boolean-string' }).CRON_ENABLED).toBe(false);
        expect(validateEnv({ ...baseConfig, CRON_ENABLED: '' }).CRON_ENABLED).toBe(false);
        expect(validateEnv({ ...baseConfig, CRON_ENABLED: undefined }).CRON_ENABLED).toBe(false);
      });
    });

    describe('UPLOAD_DIR', () => {
      it('throws an error if missing', () => {
        expect(() => { validateEnv({ ...baseConfig, UPLOAD_DIR: undefined }); }).toThrow(Error);
      });
    });

    describe('STORAGE_LOCATION_GENERATOR_PREFIX', () => {
      it('reformats with leading and trailing slashes as expected', () => {
        expect(validateEnv(
          { ...baseConfig, STORAGE_LOCATION_GENERATOR_PREFIX: undefined },
        ).STORAGE_LOCATION_GENERATOR_PREFIX).toBe('/');
        expect(validateEnv(
          { ...baseConfig, STORAGE_LOCATION_GENERATOR_PREFIX: '' },
        ).STORAGE_LOCATION_GENERATOR_PREFIX).toBe('/');
        expect(validateEnv(
          { ...baseConfig, STORAGE_LOCATION_GENERATOR_PREFIX: 'custom-prefix' },
        ).STORAGE_LOCATION_GENERATOR_PREFIX).toBe('/custom-prefix/');
        expect(validateEnv(
          { ...baseConfig, STORAGE_LOCATION_GENERATOR_PREFIX: '/custom-prefix' },
        ).STORAGE_LOCATION_GENERATOR_PREFIX).toBe('/custom-prefix/');
        expect(validateEnv(
          { ...baseConfig, STORAGE_LOCATION_GENERATOR_PREFIX: 'custom-prefix/' },
        ).STORAGE_LOCATION_GENERATOR_PREFIX).toBe('/custom-prefix/');
        expect(validateEnv(
          { ...baseConfig, STORAGE_LOCATION_GENERATOR_PREFIX: '/custom-prefix/' },
        ).STORAGE_LOCATION_GENERATOR_PREFIX).toBe('/custom-prefix/');
      });
    });
  });
});
