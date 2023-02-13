import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ArtistDeletionState, ArtistStatus, ArtistType } from './artist.enums';

export class ArtistUnusedFields {
  @Prop({ default: null })
  descriptions: string;

  @Prop({ default: null })
  logo: string;

  @Prop({ default: ArtistType.Free, enum: [ArtistType.Free, ArtistType.Paid] })
  type: ArtistType;

  @Prop({ default: ArtistStatus.InActive, enum: [ArtistStatus.InActive, ArtistStatus.Active, ArtistStatus.Deactive] })
  status: ArtistStatus;

  @Prop({ default: ArtistDeletionState.NotDeleted, enum: [ArtistDeletionState.NotDeleted, ArtistDeletionState.Deleted] })
  deleted: ArtistDeletionState;

  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;
}
