import { Prop } from '@nestjs/mongoose';
import { FeedReplyLikeStatus, FeedReplyLikeDeletionState } from './feedReplyLike.enums';

export class FeedReplyLikeUnusedFields {
  @Prop({
    required: true,
    enum: [
      FeedReplyLikeStatus.Inactive,
      FeedReplyLikeStatus.Active,
    ],
    default: FeedReplyLikeStatus.Active,
  })
  status: FeedReplyLikeStatus;

  @Prop({
    required: true,
    enum: [
      FeedReplyLikeDeletionState.NotDeleted,
      FeedReplyLikeDeletionState.Deleted,
    ],
    default: FeedReplyLikeDeletionState.NotDeleted,
  })
  deleted: FeedReplyLikeDeletionState;
}
