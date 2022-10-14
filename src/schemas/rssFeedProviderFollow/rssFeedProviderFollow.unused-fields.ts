import { Prop } from '@nestjs/mongoose';
import {
  RssFeedProviderFollowDeletionStatus,
} from './rssFeedProviderFollow.enums';

export class RssFeedProviderFollowUnusedFields {
  // This is 0 in the production database 100% of the time, so this field effectively isn't used.  We can ignore it.
  @Prop({
    enum: [RssFeedProviderFollowDeletionStatus.NotDeleted, RssFeedProviderFollowDeletionStatus.Deleted],
    default: RssFeedProviderFollowDeletionStatus.NotDeleted,
  })
  deleted: RssFeedProviderFollowDeletionStatus;
}
