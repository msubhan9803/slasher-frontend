import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userSettingFactory } from '../../factories/user-setting.factory';
import { UserSettingsService } from '../../../src/settings/providers/user-settings.service';
import { userFactory } from '../../factories/user.factory';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { dropCollections } from '../../helpers/mongo-helpers';

describe('GET settings (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let userSettingsService: UserSettingsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    userSettingsService = moduleRef.get<UserSettingsService>(UserSettingsService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await dropCollections(connection);
  });

  describe('GET /settings/notifications', () => {
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
    });

    describe('Find a user setting by id', () => {
      it('returns the expected user', async () => {
        await userSettingsService.create(
          userSettingFactory.build({
            userId: activeUser._id,
          }),
        );
        const response = await request(app.getHttpServer())
          .get('/settings/notifications')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(await userSettingsService.findByUserId(activeUser._id)).toBeTruthy();
      });

      it('returns the expected response when the user setting is not found', async () => {
        const response = await request(app.getHttpServer())
          .get('/settings/notifications')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({
          message: 'User setting not found',
          statusCode: 404,
        });
      });
    });
  });
});
