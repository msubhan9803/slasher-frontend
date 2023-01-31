import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { MatchList } from '../matchList/matchList.schema';
import { Relation } from '../relation/relation.schema';
import { User } from '../user/user.schema';
import { MessageType } from './message.enums';
import { MessageUnusedFields } from './message.unused-fields';

@Schema({ timestamps: true })
// This represents a conversation object (which is linked to a many Messages)
export class Message extends MessageUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: MatchList.name })
  matchId: MatchList;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Relation.name })
  relationId: Relation;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  fromId: User;

  // Note: This should actually be called toId, but it was improperly in the old API
  // so we need to keep the same name until we retire the old API.
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  senderId: User;

  @Prop({ tyep: Array, default: [] })
  deletefor: mongoose.Schema.Types.ObjectId[];

  @Prop({ default: MessageType.Text })
  messageType: MessageType.Text;

  // Each message can only have ONE image. And based on the mobile app, choosing an image
  // sends the image instantly, sets the messageType to MessageType.Image, and populates the
  // message field with the word "Image".
  @Prop({ default: null })
  image: string;

  // Note: We don't query on this field in this app, but we set it to ensure compatibility with the
  // old API app.  We will probably be able to get rid of it when the old API app is retired.
  @Prop()
  created: string;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<Message>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index(
  {
    matchId: 1, deleted: 1,
  },
);
export type MessageDocument = Message & Document;
