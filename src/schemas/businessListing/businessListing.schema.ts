import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { BusinessType } from './businessListing.enums';
import { BusinessListingType } from '../businessListingType/businessListingType.schema';

@Schema({ timestamps: true })
export class BusinessListing {
  @Prop()
  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop({ enum: BusinessType, required: true })
  businesstype: BusinessType;

  @Prop({ default: null, ref: BusinessListingType.name, required: true })
  listingType: mongoose.Schema.Types.ObjectId;

  @Prop()
  image: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  overview: string;

  @Prop()
  link: string;

  @Prop({ default: true })
  isActive: boolean;

  /***********
   * Fields for books *
   ***********/
  @Prop()
  author?: string;

  @Prop()
  pages?: number;

  @Prop()
  isbn?: string;

  /***********
   * Fields for movies *
   ***********/
  @Prop()
  yearReleased?: number;

  @Prop()
  countryOfOrigin?: string;

  @Prop()
  durationInMinutes?: number;

  @Prop()
  officialRatingReceived?: string;

  @Prop({ type: Map, of: String })
  trailerLinks?: {
    main: string;
    trailer2: string;
    trailer3: string;
  };

  @Prop([{ castImage: String, name: String, characterName: String }])
  casts?: {
    castImage: string;
    name: string;
    characterName: string;
  }[];

  constructor(options?: Partial<BusinessListing>) {
    if (!options) {
      return;
    }
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });
  }
}

export const BusinessListingSchema = SchemaFactory.createForClass(BusinessListing);

BusinessListingSchema.index({ listingType: 1 });
BusinessListingSchema.index({ title: 1 });
BusinessListingSchema.index({ isActive: 1 });

export type BusinessListingDocument = HydratedDocument<BusinessListing>;
