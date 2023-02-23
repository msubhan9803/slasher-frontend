import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../user/user.schema';
import { ReportReaction } from './reportAndUnreport.enums';
import { ReportAndUnreportUnusedFields } from './reportAndUnreport.unused-fields';

@Schema({ timestamps: true })
export class ReportAndUnreport extends ReportAndUnreportUnusedFields {
  /***********
   * Fields *
   ***********/

  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop()
  createdAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop()
  updatedAt: Date; // automatically populated on save by Mongoose {timestamps: true} configuration

  @Prop({
    type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true,
  })
  to: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true,
  })
  from: User;

  @Prop({
    enum: [ReportReaction.Reported, ReportReaction.Unreported],
  })
  reaction: ReportReaction;

  @Prop({ default: null })
  reasonOfReport: string;

  /***********
   * Methods *
   ***********/

  constructor(options?: Partial<ReportAndUnreport>) {
    super();
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const ReportAndUnreportSchema = SchemaFactory.createForClass(ReportAndUnreport);

export type ReportAndUnreportDocument = HydratedDocument<ReportAndUnreport>;
