import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ListingName } from './businessListingType.enums';

@Schema({ timestamps: true })
export class BusinessListingType {
  @Prop()
  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop({ enum: ListingName, required: true })
  name: ListingName;

  @Prop({ required: true })
  label: string;

  @Prop([String])
  features: string[];

  @Prop({ required: true })
  price: number;

  constructor(options?: Partial<BusinessListingType>) {
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const BusinessListingTypeSchema = SchemaFactory.createForClass(BusinessListingType);

BusinessListingTypeSchema.index({ name: 1 });
BusinessListingTypeSchema.index({ price: 1 });

export type BusinessListingTypeDocument = HydratedDocument<BusinessListingType>;
