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
import { ArtistsService } from '../../../src/artists/providers/artists.service';
import { artistsFactory } from '../../factories/artists.factory';
import {
  ArtistStatus,
  ArtistDeletionState,
} from '../../../src/schemas/artist/artist.enums';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';
import { rewindAllFactories } from '../../helpers/factory-helpers.ts';
import { configureAppPrefixAndVersioning } from '../../../src/utils/app-setup-utils';

describe('Find All Artists (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let artistsService: ArtistsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    artistsService = moduleRef.get<ArtistsService>(ArtistsService);
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

  describe('GET /api/v1/artists', () => {
    it('Find all Artists with name sorting', async () => {
      await artistsService.create(
        artistsFactory.build({
          status: ArtistStatus.Active,
          name: 'The Canvas Life',
          deleted: ArtistDeletionState.NotDeleted,
        }),
      );
      await artistsService.create(
        artistsFactory.build({
          status: ArtistStatus.Active,
          name: 'Capture the Art',
          deleted: ArtistDeletionState.NotDeleted,
        }),
      );
      await artistsService.create(
        artistsFactory.build({
          status: ArtistStatus.Active,
          name: 'Ink & Splashes',
          deleted: ArtistDeletionState.NotDeleted,
        }),
      );
      const response = await request(app.getHttpServer())
        .get('/api/v1/artists')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'Capture the Art',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'Ink & Splashes',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'The Canvas Life',
        },
      ]);
    });
  });
});
