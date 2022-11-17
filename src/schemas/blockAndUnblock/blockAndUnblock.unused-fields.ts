import { Prop } from '@nestjs/mongoose';

export class BlockAndUnblockUnusedFields {
  // This field is null 100% of the time in the database. We should be able to remove it once
  // we retire the old API.
  @Prop({ default: null })
  reasonOfReport: null;

  // This field is null 100% of the time in the database. We should be able to remove it once
  // we retire the old API.
  @Prop({ default: null })
  requestFrom: null;

  // This field is null 100% of the time in the database. We should be able to remove it once
  // we retire the old API.
  @Prop({ default: null, ref: 'relations' })
  relationId: null;

  // When the old API is retired, we can get rid of this field.  It's redundant since we also
  // have an automatically set createdAt field.
  @Prop({ default: Date.now })
  created: Date;
}
