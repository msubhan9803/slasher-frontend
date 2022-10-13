import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class FriendUnusedFields {
  // NOT USED
  // In current production db, all records hold a value of null for this field, so it's actually
  // not used in the old API either. It is referenced in the code though, so we can't get rid of
  // it until we retire the old API.
  @Prop({ default: null, ref: 'relations' })
  relationId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null })
  reasonOfReport: string;

  @Prop({ default: Date.now })
  created: Date;
}
