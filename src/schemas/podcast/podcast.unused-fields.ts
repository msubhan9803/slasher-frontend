import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { PodcastDeletionState, PodcastStatus, PodcastType } from './podcast.enums';

export class PodcastUnusedFields {
  @Prop({ default: null })
  descriptions: string;

  @Prop({ default: null })
  logo: string;

  @Prop({ default: PodcastType.Free })
  type: PodcastType;

  @Prop({ default: PodcastStatus.InActive })
  status: PodcastStatus;

  @Prop({ default: PodcastDeletionState.NotDeleted })
  deleted: PodcastDeletionState;

  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;
}
