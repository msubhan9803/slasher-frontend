import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessListing, BusinessListingSchema } from 'src/schemas/businessListing/businessListing.schema';
import { BusinessListingType, BusinessListingTypeSchema } from 'src/schemas/businessListingType/businessListingType.schema';
import { ConfigService } from '@nestjs/config';
import { StorageLocationService } from 'src/global/providers/storage-location.service';
import { LocalStorageService } from 'src/local-storage/providers/local-storage.service';
import { S3StorageService } from 'src/local-storage/providers/s3-storage.service';
import { BooksService } from 'src/books/providers/books.service';
import { BookUserStatus, BookUserStatusSchema } from 'src/schemas/bookUserStatus/bookUserStatus.schema';
import { RecentBookBlock, RecentBookBlockSchema } from 'src/schemas/recentBookBlock/recentBookBlock.schema';
import { HttpModule } from '@nestjs/axios';
import { BookUserStatusModule } from 'src/book-user-status/book.user.status.module';
import { User, UserSchema } from 'src/schemas/user/user.schema';
import { Book, BookSchema } from 'src/schemas/book/book.schema';
import { BusinessListingController } from './business-listing.controller';
import { BusinessListingService } from './providers/business-listing.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BusinessListing.name, schema: BusinessListingSchema }]),
    MongooseModule.forFeature([{ name: BusinessListingType.name, schema: BusinessListingTypeSchema }]),
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    MongooseModule.forFeature([{ name: BookUserStatus.name, schema: BookUserStatusSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: RecentBookBlock.name, schema: RecentBookBlockSchema }]),
    HttpModule,
    BookUserStatusModule,
  ],
  providers: [
    BusinessListingService,
    ConfigService,
    LocalStorageService,
    S3StorageService,
    StorageLocationService,
    BooksService,
  ],
  exports: [BusinessListingService],
  controllers: [BusinessListingController],
})
export class BusinessListingModule {}
