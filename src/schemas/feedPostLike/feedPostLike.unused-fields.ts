import { Prop } from '@nestjs/mongoose';
import { FeedPostLikeStatus, FeedPostLikeDeletionState } from './feedPostLike.enums';

export class FeedPostLikeUnusedFields {
  @Prop({
    required: true,
    enum: [
      FeedPostLikeStatus.Inactive,
      FeedPostLikeStatus.Active,
    ],
    default: FeedPostLikeStatus.Active,
  })
  status: FeedPostLikeStatus;

  @Prop({
    required: true,
    enum: [
      FeedPostLikeDeletionState.NotDeleted,
      FeedPostLikeDeletionState.Deleted,
    ],
    default: FeedPostLikeDeletionState.NotDeleted,
  })
  deleted: FeedPostLikeDeletionState;
}
