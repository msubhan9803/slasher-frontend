/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { MusicService } from '../../../src/music/providers/music.service';
import { musicFactory } from '../../factories/music.factory';
import {
  MusicStatus,
  MusicDeletionState,
} from '../../../src/schemas/music/music.enums';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';
import { rewindAllFactories } from '../../helpers/factory-helpers.ts';
import { configureAppPrefixAndVersioning } from '../../../src/utils/app-setup-utils';

describe('Find All Music (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let musicService: MusicService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    musicService = moduleRef.get<MusicService>(MusicService);
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

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('GET /api/v1/music', () => {
    it('Find all Music with name sorting', async () => {
      await musicService.create(
        musicFactory.build({
          status: MusicStatus.Active,
          name: 'Addicted to Love',
          deleted: MusicDeletionState.NotDeleted,
        }),
      );
      await musicService.create(
        musicFactory.build({
          status: MusicStatus.Active,
          name: 'Baby, Wont you please come home',
          deleted: MusicDeletionState.NotDeleted,
        }),
      );
      await musicService.create(
        musicFactory.build({
          status: MusicStatus.Active,
          name: 'The Ballad of Sweeney Todd',
          deleted: MusicDeletionState.NotDeleted,
        }),
      );
      const response = await request(app.getHttpServer())
        .get('/api/v1/music')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'Addicted to Love',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'Baby, Wont you please come home',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'The Ballad of Sweeney Todd',
        },
      ]);
    });
  });
});
