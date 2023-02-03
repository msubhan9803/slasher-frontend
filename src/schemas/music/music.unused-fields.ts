import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { MusicDeletionState, MusicStatus, MusicType } from './music.enums';

export class MusicUnusedFields {
  @Prop({ default: null })
  descriptions: string;

  @Prop({ default: null })
  logo: string;

  @Prop({ default: MusicType.Free })
  type: MusicType;

  @Prop({ default: MusicStatus.InActive })
  status: MusicStatus;

  @Prop({ default: MusicDeletionState.NotDeleted })
  deleted: MusicDeletionState;

  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;
}
