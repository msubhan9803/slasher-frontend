import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {
  MatchListFlag,
} from './matchList.enums';

export class MatchListUnusedFields {
  // Note: The default value below is weird, but it doesn't seem to matter and this
  // 'undefinedundefinedundefined' value is the kind of thing we see in the current prod database
  // (though in the prod database, 'undefined' is repeated many more times).
  @Prop({ default: 'undefinedundefinedundefined' })
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
