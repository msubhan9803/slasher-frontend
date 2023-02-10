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
import { PodcastsService } from '../../../src/podcasts/providers/podcasts.service';
import { podcastsFactory } from '../../factories/podcasts.factory';
import {
  PodcastStatus,
  PodcastDeletionState,
} from '../../../src/schemas/podcast/podcast.enums';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';

describe('Find All Podcasts (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let podcastsService: PodcastsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    podcastsService = moduleRef.get<PodcastsService>(PodcastsService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('GET All Podcasts', () => {
    it('Find all Podcasts with name sorting', async () => {
      await podcastsService.create(
        podcastsFactory.build({
          status: PodcastStatus.Active,
          name: 'Freakonomics Radio',
          deleted: PodcastDeletionState.NotDeleted,
        }),
      );
      await podcastsService.create(
        podcastsFactory.build({
          status: PodcastStatus.Active,
          name: 'My Favourite murder',
          deleted: PodcastDeletionState.NotDeleted,
        }),
      );
      await podcastsService.create(
        podcastsFactory.build({
          status: PodcastStatus.Active,
          name: 'Dark Diaries',
          deleted: PodcastDeletionState.NotDeleted,
        }),
      );
      const response = await request(app.getHttpServer())
        .get('/podcasts')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'Dark Diaries',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'Freakonomics Radio',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'My Favourite murder',
        },
      ]);
    });
  });
});
