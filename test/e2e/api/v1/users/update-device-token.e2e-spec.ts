import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Users Update Device Token (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;

  const deviceAndAppVersionPlaceholderSignInFields = {
    device_id: 'sample-device-id',
    device_token: 'sample-device-token',
    device_type: 'sample-device-type',
    device_version: 'sample-device-version',
    app_version: 'sample-app-version',
  };

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

  describe('POST /api/v1/users/update-device-token', () => {
    beforeEach(async () => {
      const userDevices = [];
      for (let i = 1; i <= 2; i += 1) {
        const weekAgo = DateTime.now().minus({ days: i }).toISODate();
        userDevices.push(
          {
            ...deviceAndAppVersionPlaceholderSignInFields,
            device_id: `${i}`,
            login_date: weekAgo,
          },
        );
      }
      const userData = userFactory.build();
      userData.userDevices = userDevices;
      activeUser = await usersService.create(userData);
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer()).post('/api/v1/users/update-device-token').expect(HttpStatus.UNAUTHORIZED);
    });

    it('finds the expected user and update device token', async () => {
      const postBody = {
        device_token: 'new-device-token',
        device_id: '1',
      };
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/update-device-token')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(postBody);
      expect(response.body).toEqual({ success: true });
      const user = await usersService.findById(activeUser.id, true);
      expect(user.userDevices[0].device_token).toBe('new-device-token');
    });

    it('when device id is not exist than expected response', async () => {
      const postBody = {
        device_token: 'sample-device-token',
        device_id: '3',
      };
      const response = await request(app.getHttpServer())
        .post('/api/v1/users/update-device-token')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send(postBody);
      expect(response.body).toEqual({ statusCode: 400, message: 'Device id not found' });
    });

    describe('DTO validations', () => {
      it('device_id should not be empty', async () => {
        const postBody = {
          device_id: '',
          device_token: 'token',
        };
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/update-device-token')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'device_id should not be empty',
        );
      });

      it('device_token should not be empty', async () => {
        const postBody = {
          device_id: '3',
          device_token: '',
        };
        const response = await request(app.getHttpServer())
          .post('/api/v1/users/update-device-token')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(postBody);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('device_token should not be empty');
      });
    });
  });
});
