import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { PodcastDeletionState, PodcastStatus, PodcastType } from './podcast.enums';

export class PodcastUnusedFields {
  @Prop({ default: null })
  descriptions: string;

  @Prop({ default: null })
  logo: string;

  @Prop({ default: PodcastType.Free, enum: [PodcastType.Free, PodcastType.Paid] })
  type: PodcastType;

  @Prop({ default: PodcastStatus.InActive, enum: [PodcastStatus.InActive, PodcastStatus.Active, PodcastStatus.Deactive] })
  status: PodcastStatus;

  @Prop({ default: PodcastDeletionState.NotDeleted, enum: [PodcastDeletionState.NotDeleted, PodcastDeletionState.Deleted] })
  deleted: PodcastDeletionState;

  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;
}
