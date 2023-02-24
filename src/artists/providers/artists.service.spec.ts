/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { AppModule } from '../../app.module';
import { ArtistsService } from './artists.service';
import { artistsFactory } from '../../../test/factories/artists.factory';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import {
  ArtistStatus,
  ArtistDeletionState,
} from '../../schemas/artist/artist.enums';

const mockHttpService = () => ({});

describe('artistsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let artistsService: ArtistsService;

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
  });

  it('should be defined', () => {
    expect(artistsService).toBeDefined();
  });

  describe('#findAll', () => {
    it('finds all the expected artists that are activated and not deleted', async () => {
      await artistsService.create(
        artistsFactory.build({
          status: ArtistStatus.Active,
          deleted: ArtistDeletionState.NotDeleted,
          name: 'Ink & Splashes',
        }),
      );
      await artistsService.create(
        artistsFactory.build({
          status: ArtistStatus.InActive,
          deleted: ArtistDeletionState.NotDeleted,
          name: 'Capture the Art',
        }),
      );
      await artistsService.create(
        artistsFactory.build({
          status: ArtistStatus.Active,
          deleted: ArtistDeletionState.Deleted,
          name: 'The Canvas Life',
        }),
      );
      await artistsService.create(
        artistsFactory.build({
          status: ArtistStatus.InActive,
          deleted: ArtistDeletionState.Deleted,
          name: 'The diffrent Artist',
        }),
      );

      const activeArtists = await artistsService.findAll(true);
      expect(activeArtists).toHaveLength(1);
      expect(activeArtists[0].name).toBe('Ink & Splashes');
    });
  });
});
