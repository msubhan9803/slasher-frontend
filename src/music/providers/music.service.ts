import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Music, MusicDocument } from '../../schemas/music/music.schema';
import {
  MusicStatus,
  MusicDeletionState,
} from '../../schemas/music/music.enums';

@Injectable()
export class MusicService {
  constructor(
    @InjectModel(Music.name) private musicModel: Model<MusicDocument>,
  ) {}

  async create(musicData: Partial<Music>): Promise<MusicDocument> {
    return this.musicModel.create(musicData);
  }

  async findAll(): Promise<MusicDocument[]> {
    const musicFind: any = {
      deleted: MusicDeletionState.NotDeleted,
      status: MusicStatus.Active,
    };

    return this.musicModel
      .find(musicFind)
      .select('name')
      .sort({
        name: 1,
      })
      .exec();
  }
}
