import { Prop } from '@nestjs/mongoose';
import { RelationDeletionState, RelationStatus } from './relation.enums';

export class RelationUnusedFields {
  // NOT USED
  @Prop({ default: '', required: true, unique: true })
  to: string;

  @Prop({
    enum: [RelationStatus.Inactive, RelationStatus.Active],
    default: RelationStatus.Active,
  })
  userType: RelationStatus;

  // NOT USED
  @Prop({
    required: true,
    enum: [
      RelationDeletionState.NotDeleted,
      RelationDeletionState.Deleted,
    ],
    default: RelationDeletionState.NotDeleted,
  })
  is_deleted: RelationDeletionState;
}
