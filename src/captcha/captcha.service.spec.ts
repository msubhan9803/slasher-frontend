/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AppModule } from '../app.module';
import { clearDatabase } from '../../test/helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../utils/app-setup-utils';
import { rewindAllFactories } from '../../test/helpers/factory-helpers.ts';
import { CaptchaService } from './captcha.service';

const mockHttpService = () => ({
});

describe('CaptchaService', () => {
  let app: INestApplication;
  let connection: Connection;
  let captchaService: CaptchaService;
  let httpService: HttpService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        { provide: HttpService, useFactory: mockHttpService },
      ],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    captchaService = moduleRef.get<CaptchaService>(CaptchaService);
    httpService = moduleRef.get<HttpService>(HttpService);

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

  it('should be defined', () => {
    expect(captchaService).toBeDefined();
  });

  describe('#verifyHCaptchaToken', () => {
    it('should verify hCaptcha token and return data', async () => {
      const token = '48ed6df1-a1f2-4267-a3b9-7aadafbca5b3';
      const responseData = {
        success: true,
      };
      jest.spyOn(httpService, 'post').mockImplementation(() => of({
        data: responseData,
        status: 200,
        statusText: '',
        headers: {},
        config: {},
      }));
      const result = await captchaService.verifyHCaptchaToken(token);
      expect(result).toEqual(responseData);
    });

    it('should handle invalid hCaptcha token', async () => {
      const token = 'invalid-token';
      const errorResponse = {
        success: false,
        error: 'Captcha validation failed. Please try again.',
      };
      jest.spyOn(httpService, 'post').mockImplementation(() => of({
        data: errorResponse,
        status: 200,
        statusText: '',
        headers: {},
        config: {},
      }));
      const result = await captchaService.verifyHCaptchaToken(token);
      expect(result).toEqual(errorResponse);
    });
  });
});
