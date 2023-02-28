/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { AppModule } from '../../app.module';
import { PodcastsService } from './podcasts.service';
import { podcastsFactory } from '../../../test/factories/podcasts.factory';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import {
  PodcastStatus,
  PodcastDeletionState,
} from '../../schemas/podcast/podcast.enums';

const mockHttpService = () => ({});

describe('PodcastsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let podcastService: PodcastsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [{ provide: HttpService, useFactory: mockHttpService }],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    podcastService = moduleRef.get<PodcastsService>(PodcastsService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  it('should be defined', () => {
    expect(podcastService).toBeDefined();
  });

  describe('#findAll', () => {
    it('finds all the expected podcasts that are activated and not deleted', async () => {
      await podcastService.create(
        podcastsFactory.build({
          status: PodcastStatus.Active,
          deleted: PodcastDeletionState.Deleted,
          name: 'Dark Diaries',
        }),
      );
      await podcastService.create(
        podcastsFactory.build({
          status: PodcastStatus.InActive,
          deleted: PodcastDeletionState.NotDeleted,
          name: 'My Favourite murder',
        }),
      );
      await podcastService.create(
        podcastsFactory.build({
          status: PodcastStatus.Active,
          deleted: PodcastDeletionState.NotDeleted,
          name: 'Freakonomics Radio',
        }),
      );
      await podcastService.create(
        podcastsFactory.build({
          status: PodcastStatus.InActive,
          deleted: PodcastDeletionState.NotDeleted,
          name: 'The diffrent Podcast',
        }),
      );

      const activePodcasts = await podcastService.findAll(true);
      expect(activePodcasts).toHaveLength(1);
      expect(activePodcasts[0].name).toBe('Freakonomics Radio');
    });
  });
});
