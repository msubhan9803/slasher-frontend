import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessListing, BusinessListingSchema } from 'src/schemas/businessListing/businessListing.schema';
import { BusinessListingType, BusinessListingTypeSchema } from 'src/schemas/businessListingType/businessListingType.schema';
import { BusinessListingController } from './business-listing.controller';
import { BusinessListingService } from './providers/business-listing.service';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: BusinessListing.name, schema: BusinessListingSchema }]),
      MongooseModule.forFeature([{ name: BusinessListingType.name, schema: BusinessListingTypeSchema }]),
    ],
  controllers: [BusinessListingController],
  providers: [BusinessListingService],
})
export class BusinessListingModule {}
