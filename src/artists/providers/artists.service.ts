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

  async findAll(activeOnly: boolean): Promise<ArtistDocument[]> {
    const artistFindAllQuery: any = {};
    if (activeOnly) {
      artistFindAllQuery.deleted = ArtistDeletionState.NotDeleted;
      artistFindAllQuery.status = ArtistStatus.Active;
    }
    return this.artistsModel
      .find(artistFindAllQuery)
      .select('name')
      .sort({ name: 1 })
      .exec();
  }
}
