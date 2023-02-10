/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { AppModule } from '../../app.module';
import { MusicService } from './music.service';
import { musicFactory } from '../../../test/factories/music.factory';
import { MusicDocument } from '../../schemas/music/music.schema';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';

const mockHttpService = () => ({});

describe('MusicService', () => {
  let app: INestApplication;
  let connection: Connection;
  let musicService: MusicService;
  let music: MusicDocument;

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
    music = await musicService.create(musicFactory.build());
  });

  it('should be defined', () => {
    expect(musicService).toBeDefined();
  });

  describe('#findAll', () => {
    it('finds the expected music details', async () => {
      const musicDetails = await musicService.findAll();
      expect(musicDetails.map((musicData) => musicData.name)).toEqual([music.name]);
    });
  });
});
