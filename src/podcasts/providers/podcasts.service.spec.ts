/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { AppModule } from '../../app.module';
import { PodcastsService } from './podcasts.service';
import { podcastsFactory } from '../../../test/factories/podcasts.factory';
import { PodcastDocument } from '../../schemas/podcast/podcast.schema';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';

const mockHttpService = () => ({});

describe('PodcastsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let podcastService: PodcastsService;
  let podcast: PodcastDocument;

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
    podcast = await podcastService.create(podcastsFactory.build());
  });

  it('should be defined', () => {
    expect(podcastService).toBeDefined();
  });

  describe('#findAll', () => {
    it('finds the expected podcast details', async () => {
      const podcastDetails = await podcastService.findAll();
      expect(podcastDetails.map((podcastData) => podcastData.name)).toEqual([
        podcast.name,
      ]);
    });
  });
});
