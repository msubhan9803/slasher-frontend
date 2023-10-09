import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { HashtagActiveStatus, HashtagDeletionStatus } from './hashtag.enums';

@Schema({ timestamps: true })
export class Hashtag {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({ default: null, required: true })
  name: string;

  @Prop({ default: 0 })
  totalPost: number;

  @Prop({
    enum: [
      HashtagActiveStatus.Inactive,
      HashtagActiveStatus.Active,
      HashtagActiveStatus.Deactivated,
    ],
    default: HashtagActiveStatus.Active,
  })
  status: HashtagActiveStatus;

  @Prop({
    enum: [
      HashtagDeletionStatus.NotDeleted,
      HashtagDeletionStatus.Deleted,
    ],
    default: HashtagDeletionStatus.NotDeleted,
  })
  deleted: HashtagDeletionStatus;
}

export const HashtagSchema = SchemaFactory.createForClass(Hashtag);

HashtagSchema.index(
  {
    name: 1,
  },
);

export type HashtagDocument = HydratedDocument<Hashtag>;
