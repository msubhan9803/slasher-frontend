import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class DisallowedUsername {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ required: true })
  username: string;

  @Prop({ default: false, required: true })
  notifyIfUsernameContains: boolean;
}

export const DisallowedUsernameSchema = SchemaFactory.createForClass(DisallowedUsername);

export type DisallowedUsernameDocument = HydratedDocument<DisallowedUsername>;

DisallowedUsernameSchema.index(
  { username: 1 },
  {
    name: 'caseInsensitiveUsername',
    collation: { locale: 'en', strength: 2 },
  },
);
