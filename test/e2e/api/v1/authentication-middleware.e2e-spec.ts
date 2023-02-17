import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { AppModule } from '../../../../src/app.module';
import { UsersService } from '../../../../src/users/providers/users.service';
import { userFactory } from '../../../factories/user.factory';
import { clearDatabase } from '../../../helpers/mongo-helpers';
import { sleep } from '../../../../src/utils/timer-utils';

describe('Authentication middleware tests', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  describe('Any authenticated request', () => {
    it('updates the updatedAt value for the authenticated user if the '
      + 'previous updatedAt value was from more than 6 hours ago', async () => {
        const activeUser = await usersService.create(userFactory.build({}));
        activeUserAuthToken = activeUser.generateNewJwtToken(
          configService.get<string>('JWT_SECRET_KEY'),
        );

        // Set createdAt and updatedAt times to 1 day ago
        activeUser.createdAt = DateTime.local().minus({ days: 2 }).toJSDate();
        activeUser.updatedAt = DateTime.local().minus({ days: 2 }).toJSDate();
        await activeUser.save({ timestamps: false });

        // Make request
        const userBeforeRequest = await usersService.findById(activeUser.id);
        await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();

        // Expect timestamp change
        const userAfterRequest = await usersService.findById(activeUser.id);
        expect(userBeforeRequest.updatedAt).toBeInstanceOf(Date);
        expect(userAfterRequest.updatedAt).toBeInstanceOf(Date);
        expect(userAfterRequest.updatedAt > activeUser.updatedAt).toBeTruthy();

        // Wait a moment
        await sleep(50);

        // Make second request right after
        await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();

        // Expect NO second timestamp change (because previous request was so recent)
        const userAfterSecondRequest = await usersService.findById(activeUser.id);
        expect(userAfterRequest.updatedAt).toEqual(userAfterSecondRequest.updatedAt);
      });
  });
});
