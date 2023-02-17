import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../user/user.schema';
import { MatchListRoomCategory, MatchListRoomType } from '../matchList/matchList.enums';
import { ChatUnusedFields } from './chat.unused-fields';
import { MatchList } from '../matchList/matchList.schema';

@Schema({ timestamps: true })
/**
 * IMPORTANT NOTE: We only use this Chat model in ONE place in the entire app, and it's only for
 * compatibility with the old API.  It can probably be deleted (along with the "chats" db
 * collection) after the old API is retired.
 * Where is it used?  Whenever a new MatchList is created, we create a corresponding Chat record
 * that references the MatchList.  If this corresponding Chat record is not created, the old API
 * will not return the associated conversation and it will not show up in the list of conversations
 * on the iOS/Android app "Messages" screen.
 * A Chat record stores many of the same values as its MatchList, so it's very redundant.
 */
export class Chat extends ChatUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ default: null, ref: 'relations', required: true })
  relationId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: MatchList.name, required: true })
  matchId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  roomCategory: MatchListRoomCategory;

  @Prop({ required: true })
  roomType: MatchListRoomType;

  @Prop({ default: [], ref: User.name, required: true })
  participants: mongoose.Schema.Types.ObjectId[];

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<Chat>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

export type ChatDocument = HydratedDocument<Chat>;
