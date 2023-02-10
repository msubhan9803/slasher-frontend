import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist, ArtistDocument } from '../../schemas/artist/artist.schema';
import {
  ArtistStatus,
  ArtistDeletionState,
} from '../../schemas/artist/artist.enums';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectModel(Artist.name) private artistsModel: Model<ArtistDocument>,
  ) {}

  async create(artistData: Partial<Artist>): Promise<ArtistDocument> {
    return this.artistsModel.create(artistData);
  }

  async findAll(): Promise<ArtistDocument[]> {
    const artistFind: any = {
      deleted: ArtistDeletionState.NotDeleted,
      status: ArtistStatus.Active,
    };

    return this.artistsModel
      .find(artistFind)
      .select('name')
      .sort({
        name: 1,
      })
      .exec();
  }
}
