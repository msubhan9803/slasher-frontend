import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ArtistDeletionState, ArtistStatus, ArtistType } from './artist.enums';

export class ArtistUnusedFields {
  @Prop({ default: null })
  descriptions: string;

  @Prop({ default: null })
  logo: string;

  @Prop({ default: ArtistType.Free })
  type: ArtistType;

  @Prop({ default: ArtistStatus.InActive })
  status: ArtistStatus;

  @Prop({ default: ArtistDeletionState.NotDeleted })
  deleted: ArtistDeletionState;

  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;
}
