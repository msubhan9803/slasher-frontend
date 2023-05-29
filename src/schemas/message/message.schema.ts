import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
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

  // Each message can only have ONE image. We put this image in the `image` field and set the
  // message text to "Image" so that it shows up with the word "Image" in message previews.
  // message field with the word "Image".
  @Prop({ default: null })
  image: string;

  // The old API puts the uploaded chat message image in this urls array, so we will redundantly
  // put it in there too.
  // TODO: In the future, we'll probably want to migrate data `urls` field to the `image` field.
  // In almost all cases, there is only one value in the `urls` field for legacy data.  There are
  // only 124 cases where `urls` has more than one element in the production database, and these
  // appear to be either tests or related to a feature that is not supported.
  @Prop({ type: Array, default: [] })
  urls: string[];

  @Prop({ default: null })
  imageDescription: string;

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

// Index for ChatService#getMessages
MessageSchema.index(
  {
    participants: 1, matchId: 1, deleted: 1,
  },
);
// Index for ChatService#getUnreadDirectPrivateMessageCount
MessageSchema.index(
  {
    isRead: 1, relationId: 1, senderId: 1, is_deleted: 1,
  },
);
// Index for ChatService#deleteConversationMessages
MessageSchema.index(
  {
    matchId: 1, deletefor: 1,
  },
);

export type MessageDocument = HydratedDocument<Message>;
