import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { BookUserStatus, BookUserStatusSchema } from '../schemas/bookUserStatus/bookUserStatus.schema';
import { RecentBookBlock, RecentBookBlockSchema } from '../schemas/recentBookBlock/recentBookBlock.schema';
import { BookUserStatusModule } from '../book-user-status/book.user.status.module';
import { User, UserSchema } from '../schemas/user/user.schema';
import { Book, BookSchema } from '../schemas/book/book.schema';
import { MoviesService } from '../movies/providers/movies.service';
import { Movie, MovieSchema } from '../schemas/movie/movie.schema';
import { MovieUserStatus, MovieUserStatusSchema } from '../schemas/movieUserStatus/movieUserStatus.schema';
import { RecentMovieBlock, RecentMovieBlockSchema } from '../schemas/recentMovieBlock/recentMovieBlock.schema';
import { MovieUserStatusModule } from '../movie-user-status/movie.user.status.module';
import { BusinessListingService } from './providers/business-listing.service';
import { StorageLocationService } from '../global/providers/storage-location.service';
import { BusinessListingController } from './business-listing.controller';
import { BusinessListingType, BusinessListingTypeSchema } from '../schemas/businessListingType/businessListingType.schema';
import { BusinessListing, BusinessListingSchema } from '../schemas/businessListing/businessListing.schema';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { BooksService } from '../books/providers/books.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BusinessListing.name, schema: BusinessListingSchema }]),
    MongooseModule.forFeature([{ name: BusinessListingType.name, schema: BusinessListingTypeSchema }]),
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    MongooseModule.forFeature([{ name: BookUserStatus.name, schema: BookUserStatusSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: RecentBookBlock.name, schema: RecentBookBlockSchema }]),
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    MongooseModule.forFeature([{ name: MovieUserStatus.name, schema: MovieUserStatusSchema }]),
    MongooseModule.forFeature([{ name: RecentMovieBlock.name, schema: RecentMovieBlockSchema }]),
    HttpModule,
    BookUserStatusModule,
    MovieUserStatusModule,
  ],
  providers: [
    BusinessListingService,
    ConfigService,
    LocalStorageService,
    S3StorageService,
    StorageLocationService,
    BooksService,
    MoviesService,
  ],
  exports: [BusinessListingService],
  controllers: [BusinessListingController],
})
export class BusinessListingModule {}
