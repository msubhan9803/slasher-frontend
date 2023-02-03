import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { MusicDeletionState, MusicStatus, MusicType } from './music.enums';

export class MusicUnusedFields {
  @Prop({ default: null })
  descriptions: string;

  @Prop({ default: null })
  logo: string;

  @Prop({ default: MusicType.Free, enum: [MusicType.Free, MusicType.Paid] })
  type: MusicType;

  @Prop({ default: MusicStatus.InActive, enum: [MusicStatus.InActive, MusicStatus.Active, MusicStatus.Deactive] })
  status: MusicStatus;

  @Prop({ default: MusicDeletionState.NotDeleted, enum: [MusicDeletionState.NotDeleted, MusicDeletionState.Deleted] })
  deleted: MusicDeletionState;

  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;
}
