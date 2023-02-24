import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../user/user.schema';
import { SocketUserUnusedFields } from './socketUser.unused-fields';

@Schema({ timestamps: true })
export class SocketUser extends SocketUserUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
  userId: User;

  // Note: This should actually be called toId, but it was improperly in the old API
  // so we need to keep the same name until we retire the old API.
  @Prop({ required: true })
  socketId: string;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<SocketUser>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const SocketUserSchema = SchemaFactory.createForClass(SocketUser);

export type SocketUserDocument = HydratedDocument<SocketUser>;
