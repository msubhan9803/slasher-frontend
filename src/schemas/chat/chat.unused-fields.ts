import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { MatchListStatus } from '../matchList/matchList.enums';
import { User } from '../user/user.schema';

export class ChatUnusedFields {
  @Prop({ default: [], ref: User.name, required: true })
  deletefor: mongoose.Schema.Types.ObjectId[];

  // Note: The default value below is weird, but it doesn't seem to matter and this
  // 'undefinedundefinedundefined' value is the kind of thing we see in the current prod database
  // (though in the prod database, 'undefined' is repeated many more times).
  @Prop({ default: 'undefinedundefinedundefined' })
  roomName: string;

  @Prop({ default: false })
  is_chat: boolean;

  // Note: Even though this field has a default value of Date.now, it is intentionally of type
  // string.  This is how the old API is configured, so we'll do this to match.
  @Prop({ default: Date.now })
  created: string;

  @Prop({ required: true, default: MatchListStatus.Accepted })
  status: MatchListStatus;

  @Prop({ default: false })
  deleted: boolean;
}
