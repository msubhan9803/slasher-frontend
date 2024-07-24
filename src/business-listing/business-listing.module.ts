import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessListing, BusinessListingSchema } from 'src/schemas/businessListing/businessListing.schema';
import { BusinessListingType, BusinessListingTypeSchema } from 'src/schemas/businessListingType/businessListingType.schema';
import { ConfigService } from '@nestjs/config';
import { StorageLocationService } from 'src/global/providers/storage-location.service';
import { LocalStorageService } from 'src/local-storage/providers/local-storage.service';
import { S3StorageService } from 'src/local-storage/providers/s3-storage.service';
import { BusinessListingService } from './providers/business-listing.service';
import { BusinessListingController } from './business-listing.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BusinessListing.name, schema: BusinessListingSchema }]),
    MongooseModule.forFeature([{ name: BusinessListingType.name, schema: BusinessListingTypeSchema }]),
  ],
  providers: [
    BusinessListingService,
    ConfigService,
    LocalStorageService,
    S3StorageService,
    StorageLocationService,
  ],
  exports: [BusinessListingService],
  controllers: [BusinessListingController],
})
export class BusinessListingModule {}
