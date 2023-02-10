/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { AppModule } from '../../app.module';
import { ArtistsService } from './artists.service';
import { artistsFactory } from '../../../test/factories/artists.factory';
import { ArtistDocument } from '../../schemas/artist/artist.schema';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';

const mockHttpService = () => ({});

describe('artistsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let artistsService: ArtistsService;
  let artist: ArtistDocument;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [{ provide: HttpService, useFactory: mockHttpService }],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    artistsService = moduleRef.get<ArtistsService>(ArtistsService);
    app = moduleRef.createNestApplication();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    artist = await artistsService.create(artistsFactory.build());
  });

  it('should be defined', () => {
    expect(artistsService).toBeDefined();
  });

  describe('#findAll', () => {
    it('finds the expected artists details', async () => {
      const artistDetails = await artistsService.findAll();
      expect(artistDetails.map((artistData) => artistData.name)).toEqual([artist.name]);
    });
  });
});
