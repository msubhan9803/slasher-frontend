import { Prop } from '@nestjs/mongoose';
import {
  HashTagsFollowDeletionStatus,
} from './hashtagFollows.enums';

export class HashTagsFollowUnusedFields {
  // This is 0 in the production database 100% of the time, so this field effectively isn't used.  We can ignore it.
  @Prop({
    enum: [HashTagsFollowDeletionStatus.NotDeleted, HashTagsFollowDeletionStatus.Deleted],
    default: HashTagsFollowDeletionStatus.NotDeleted,
  })
  deleted: HashTagsFollowDeletionStatus;
}
