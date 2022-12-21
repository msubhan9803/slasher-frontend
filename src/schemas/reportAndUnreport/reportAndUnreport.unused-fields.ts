import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Relation } from '../relation/relation.schema';

export class ReportAndUnreportUnusedFields {
  // NOTE: This is null 100% of the time in the prod database, so this field can be removed
  // after we retire the old API.
  @Prop({ default: null, ref: Relation.name })
  relationId: mongoose.Schema.Types.ObjectId;

  // NOTE: This is null 100% of the time in the prod database, so this field can be removed
  // after we retire the old API.
  @Prop({ default: null })
  requestFrom: string;

  // NOTE: We might be able to remove this field after the old API is retired, if we can instead
  // use the createdAt field in the admin UI.  Because we also have createdAt, it's redundant.
  @Prop({ default: Date.now })
  created: Date;
}
