import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../user/user.schema';

@Schema({ timestamps: true })
export class EmailRevertToken {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ default: null, ref: User.name, required: true })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, required: true, trim: true })
  value: string;

  @Prop({ default: null, required: true, trim: true })
  emailToRevertTo: string;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<EmailRevertToken>) {
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const EmailRevertTokenSchema = SchemaFactory.createForClass(EmailRevertToken);

export type EmailRevertTokenDocument = HydratedDocument<EmailRevertToken>;

EmailRevertTokenSchema.index({
  userId: 1, token: 1, createdAt: 1,
});
