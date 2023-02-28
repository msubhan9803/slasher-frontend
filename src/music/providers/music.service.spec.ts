/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import mongoose, { Connection } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { AppModule } from '../../app.module';
import { MusicService } from './music.service';
import { musicFactory } from '../../../test/factories/music.factory';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import {
  MusicStatus,
  MusicDeletionState,
} from '../../schemas/music/music.enums';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';

const mockHttpService = () => ({});

describe('MusicService', () => {
  let app: INestApplication;
  let connection: Connection;
  let musicService: MusicService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [{ provide: HttpService, useFactory: mockHttpService }],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    musicService = moduleRef.get<MusicService>(MusicService);
    app = moduleRef.createNestApplication();
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

  it('should be defined', () => {
    expect(musicService).toBeDefined();
  });

  describe('#create', () => {
    it('should create music', async () => {
      const sampleMusic = await musicService.create(
        musicFactory.build({
          status: MusicStatus.Active,
          name: 'Addicted to Love',
          deleted: MusicDeletionState.NotDeleted,
        }),
      );

      const music = await musicService.create(sampleMusic);
      expect(music.toObject()).toEqual({
          _id: expect.any(mongoose.Types.ObjectId),
          name: sampleMusic.name,
          status: sampleMusic.status,
          deleted: sampleMusic.deleted,
          descriptions: null,
          logo: null,
          type: 0,
          createdBy: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          __v: 0,
        });
    });
  });

  describe('#findAll', () => {
    it('finds all the expected musics that are activated and not deleted', async () => {
      await musicService.create(
        musicFactory.build({
          status: MusicStatus.Active,
          deleted: MusicDeletionState.Deleted,
          name: 'The Ballad of Sweeney Todd',
        }),
      );
      await musicService.create(
        musicFactory.build({
          status: MusicStatus.Active,
          deleted: MusicDeletionState.NotDeleted,
          name: 'Addicted to Love',
        }),
      );
      await musicService.create(
        musicFactory.build({
          status: MusicStatus.Active,
          deleted: MusicDeletionState.Deleted,
          name: 'Baby, Wont you please come home',
        }),
      );
      await musicService.create(
        musicFactory.build({
          status: MusicStatus.InActive,
          deleted: MusicDeletionState.NotDeleted,
          name: 'The diffrent Music',
        }),
      );

      const activeMusic = await musicService.findAll(true);
      expect(activeMusic).toHaveLength(1);
      expect(activeMusic[0].name).toBe('Addicted to Love');
    });
  });
});
