import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { BusinessType } from './businessListing.enums';
import { BusinessListingType } from '../businessListingType/businessListingType.schema';
import { User } from '../user/user.schema';
import { Movie } from '../movie/movie.schema';
import { Book } from '../book/book.schema';

@Schema({ timestamps: true })
export class BusinessListing {
  readonly _id: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: User.name, required: true })
  userRef: mongoose.Schema.Types.ObjectId;

  @Prop({ enum: BusinessType, required: true })
  businesstype: BusinessType;

  @Prop({ default: null, ref: BusinessListingType.name, required: true })
  listingType: mongoose.Schema.Types.ObjectId;

  @Prop()
  businessLogo?: string;

  @Prop()
  coverPhoto?: string;

  @Prop({ required: true })
  title?: string;

  @Prop({ required: true })
  overview: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null, ref: Book.name })
  bookRef?: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null, ref: Movie.name })
  movieRef?: mongoose.Schema.Types.ObjectId;

  @Prop()
  email?: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  address?: string;

  @Prop()
  websiteLink?: string;

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
