import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../user/user.schema';
import { MatchListRoomCategory, MatchListRoomType, MatchListStatus } from './matchList.enums';
import { MatchListUnusedFields } from './matchList.unused-fields';

@Schema({ timestamps: true })
// This represents a conversation object (which is linked to a many Messages)
export class MatchList extends MatchListUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  // Note: This new field was added to this new API app AND the old slasher-web API app.
  // The field is not queried in the old API app, but it is set.  It can be used in the new app.
  @Prop({ required: true, default: Date.now })
  lastMessageSentAt: Date;

  @Prop({ default: null, ref: 'relations', required: true })
  relationId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  roomCategory: MatchListRoomCategory;

  @Prop({ required: true })
  roomType: MatchListRoomType;

  @Prop({ default: [], ref: User.name, required: true })
  participants: mongoose.Schema.Types.ObjectId[];

  @Prop({ required: true, default: MatchListStatus.Accepted })
  status: MatchListStatus;

  // Since deletefor field exists, this might not be used. It is possible only one of two
  // users in a conversation to delete the conversation. So the idea of an entire conversation
  // being deleted does not make sense.
  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: [], ref: User.name })
  deletefor: mongoose.Schema.Types.ObjectId[];

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<MatchList>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const MatchListSchema = SchemaFactory.createForClass(MatchList);
export type MatchListDocument = HydratedDocument<MatchList>;

// Index for ChatService#getConversations and ChatService#createOrFindPrivateDirectMessageConversationByParticipants
MatchListSchema.index({
  // NOTE: It would be nice to have the `deletefor` array field in this index too, but MongoDB has a
  // limitation where you can only have one array field in a multi-key index, and `participants` is
  // an array field that is already in use here.
  participants: 1, roomType: 1, roomCategory: 1, relationId: 1, lastMessageSentAt: -1,
});
