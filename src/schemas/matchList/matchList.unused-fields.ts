import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {
  MatchListFlag,
} from './matchList.enums';

export class MatchListUnusedFields {
  // NOT USED
  @Prop({ default: 0 })
  roomName: string;

  // NOT USED
  // Note: In current prod db, this is null 100% of the time, so this field is not used in any
  // meaningful way.
  @Prop({ default: null })
  roomImage: string;

  // NOT USED
  @Prop({ default: MatchListFlag.NormalUser })
  flag: MatchListFlag;

  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;

  // NOT USED
  // Note: Even though this field has a default value of Date.now, it is intentionally of type
  // string.  This is how the old API is configured, so we'll do this to match.
  @Prop({ default: Date.now })
  created: string;
}
