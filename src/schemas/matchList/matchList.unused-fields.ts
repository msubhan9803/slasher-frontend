import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {
  MatchListRoomCategory, MatchListRoomType, MatchListStatus, MatchListFlag,
} from './matchList.enums';

export class MatchListUnusedFields {
  // NOT USED
  @Prop({ default: [], required: true })
  participants: mongoose.Schema.Types.ObjectId[];

  // NOT USED
  @Prop({ default: null, ref: 'relations', required: true })
  relationId: mongoose.Schema.Types.ObjectId;

  // NOT USED
  @Prop({ default: 0 })
  roomName: string;

  // NOT USED
  @Prop({ required: true })
  roomCategory: MatchListRoomCategory;

  // NOT USED
  @Prop({ required: true })
  roomType: MatchListRoomType;

  // NOT USED
  // Note: In current prod db, this is null 100% of the time, so this field is not used in any
  // meaningful way.
  @Prop({ default: null })
  roomImage: string;

  // NOT USED
  @Prop({ required: true, default: MatchListStatus.Pending })
  status: MatchListStatus;

  // NOT USED
  @Prop({ default: MatchListFlag.NormalUser })
  flag: MatchListFlag;

  // NOT USED
  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: null, ref: 'users' })
  createdBy: mongoose.Schema.Types.ObjectId;

  // NOT USED
  // Note: Even though this field has a default value of Date.now, it is intentionally of type
  // string.  This is how the old API is configured, so we'll do this to match.
  @Prop({ default: Date.now })
  created: string;
}
