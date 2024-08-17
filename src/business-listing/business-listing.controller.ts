/* eslint-disable max-lines */
/* eslint-disable max-len */
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config/dist/config.service';
import {
  UPLOAD_PARAM_NAME_FOR_FILES,
  MAXIMUM_IMAGE_UPLOAD_SIZE,
  MAX_ALLOWED_UPLOAD_FILE_FOR_BUSINESS_LISTING,
} from '../constants';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { defaultFileInterceptorFileFilter } from '../utils/file-upload-utils';
import { StorageLocationService } from '../global/providers/storage-location.service';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { BusinessListing } from '../schemas/businessListing/businessListing.schema';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { BusinessListingType } from '../schemas/businessListingType/businessListingType.schema';
import {
  BusinessType,
  TrailerLinks,
} from '../schemas/businessListing/businessListing.enums';
import { BooksService } from '../books/providers/books.service';
import { BookActiveStatus, BookType } from '../schemas/book/book.enums';
import { MoviesService } from '../movies/providers/movies.service';
import {
  Cast,
  MovieActiveStatus,
  MovieType,
} from '../schemas/movie/movie.enums';
import { getUserFromRequest } from '../utils/request-utils';
import { generateFileUploadInterceptors } from '../app/interceptors/file-upload-interceptors';
import { BusinessListingService } from './providers/business-listing.service';
import { CreateBusinessListingDto } from './dto/create-business-listing.dto';
import { CreateBusinessListingTypeDto } from './dto/create-business-listing-type.dto';
import { GetAllListingsDto } from './dto/get-all-listings.';
import { ValidateBusinessListingIdDto } from './dto/validate.business-listing-id.dto';
// import { GetAllMyListingsDto } from './dto/get-all-my-listings.';

@Controller({ path: 'business-listing', version: ['1'] })
export class BusinessListingController {
  constructor(
    private readonly businessListingService: BusinessListingService,
    private readonly config: ConfigService,
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
    private readonly storageLocationService: StorageLocationService,
    private readonly booksService: BooksService,
    private readonly moviesService: MoviesService,
  ) {}

  @TransformImageUrls('$.image')
  @Post('create-listing')
  @UseInterceptors(
    ...generateFileUploadInterceptors(
      UPLOAD_PARAM_NAME_FOR_FILES,
      MAX_ALLOWED_UPLOAD_FILE_FOR_BUSINESS_LISTING,
      MAXIMUM_IMAGE_UPLOAD_SIZE,
      {
        fileFilter: defaultFileInterceptorFileFilter,
      },
    ),
  )
  async createListing(
    @Req() request: Request,
    @Body() createBusienssListingDto: CreateBusinessListingDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    try {
      if (!files || files.length === 0) {
        throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
      }

      const casts: Cast[] = JSON.parse(createBusienssListingDto.casts ?? '[]');
      const trailerLinks: TrailerLinks = JSON.parse(
        createBusienssListingDto.trailerLinks ?? '{}',
      );

      const listingFile = files[0]; // First file is listing image or movie / book image
      const castFiles = files.slice(2); // Third onwards are cast files for listing type === movies
      const coverPhotoFile = files[1]; // Second file will be cover photo for listing types !== movies / books

      const listingStorageLocation = await this.storeFile(
        'business-listing',
        listingFile,
      );

      if (casts.length > 0) {
        for (const [index, file] of castFiles.entries()) {
          const castImageLocation = await this.storeFile(
            'business-listing-cast',
            file,
          );
          casts[index].castImage = castImageLocation;
        }
      }

      const {
        businesstype,
        listingType,
        title,
        overview,
        author,
        pages,
        isbn,
        yearReleased,
        officialRatingReceived,
        countryOfOrigin,
        durationInMinutes,
        link,
        isActive,
        email,
        phoneNumber,
        address,
        websiteLink,
      } = createBusienssListingDto;

      let movie = null;
      let book = null;

      const user = getUserFromRequest(request as any);

      const businessListing = new BusinessListing({
        userRef: user._id,
        businesstype,
        listingType,
        title,
        overview,
        isActive,
      });

      switch (businesstype) {
        case BusinessType.BOOKS:
          book = await this.booksService.create({
            type: BookType.UserDefined,
            name: title,
            sort_name: '',
            author: [author],
            numberOfPages: pages,
            isbnNumber: [isbn],
            description: overview,
            rating: parseInt(officialRatingReceived, 10),
            status: BookActiveStatus.Active,
            coverImage: {
              image_path: listingStorageLocation,
              description: '',
            },
            coverEditionKey: 'empty',
            publishDate: new Date(yearReleased),
            buyUrl: link,
            userRef: user._id,
          });

          businessListing.bookRef = book._id;
          break;

        case BusinessType.MOVIES:
          movie = await this.moviesService.create({
            type: MovieType.UserDefined,
            name: title,
            sort_name: '',
            movieImage: listingStorageLocation,
            descriptions: overview,
            trailerUrls: Object.values(trailerLinks).map(
              (trailer: string) => trailer,
            ),
            countryOfOrigin,
            durationInMinutes,
            rating: parseInt(officialRatingReceived, 10),
            releaseDate: new Date(yearReleased),
            status: MovieActiveStatus.Active,
            casts,
            watchUrl: link,
            userRef: user._id,
          });

          businessListing.movieRef = movie._id;
          break;

          default:
          businessListing.email = email;
          businessListing.phoneNumber = phoneNumber;
          businessListing.address = address;
          businessListing.websiteLink = websiteLink;
          businessListing.businessLogo = listingStorageLocation;
          businessListing.coverPhoto = await this.storeFile(
            'business-listing',
            coverPhotoFile,
          );
          break;
      }

      const createdBusinessListing = await this.businessListingService.createListing(businessListing);

      return createdBusinessListing;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('create-listing-type')
  async createListingType(
    @Body() createListingTypeDto: CreateBusinessListingTypeDto,
  ) {
    try {
      const listingType = new BusinessListingType(createListingTypeDto);

      const createdBusinessListing = await this.businessListingService.createListingType(listingType);

      return {
        _id: createdBusinessListing._id,
        name: createdBusinessListing.name,
        label: createdBusinessListing.label,
        features: createdBusinessListing.features,
        price: createdBusinessListing.price,
      };
    } catch (error) {
      throw new HttpException(
        'Unable to create listing type',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('get-all-listing-types')
  async getAllListingType() {
    try {
      const businessListingTypes = await this.businessListingService.getAllListingTypes();

      return businessListingTypes;
    } catch (error) {
      throw new HttpException(
        'Unable to create listing type',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @TransformImageUrls('$[*].businessLogo')
  @Get('get-all-listings')
  async getAllListings(@Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: GetAllListingsDto) {
    try {
      const businessListings = await this.businessListingService.getAllListings(query.businesstype);

      return businessListings;
    } catch (error) {
      throw new HttpException(
        'Unable to create listing type',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @TransformImageUrls(
    '$.podcaster[*].businessLogo',
    '$.books[*].bookRef.coverImage.image_path',
    '$.movies[*].movieRef.movieImage',
    '$.musician[*].businessLogo',
  )
  @Get('get-all-my-listings')
  async getAllMyListings(
    @Req() request: Request,
    // @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: GetAllMyListingsDto
  ) {
    try {
      const user = getUserFromRequest(request);
      const businessListings = await this.businessListingService.getAllMyListings(user.id);

      return businessListings.reduce((acc, listing) => {
        const type = listing.businesstype;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(listing);
        return acc;
      }, {});
    } catch (error) {
      throw new HttpException(
        'Unable to create listing type',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @TransformImageUrls('$.businessLogo', '$.coverPhoto', '$.bookRef.coverImage.image_path', '$.movieRef.movieImage', '$.movieRef.casts[*].castImage')
  @Get('get-listing-detail/:id')
  async getListingDetail(@Param() params: ValidateBusinessListingIdDto) {
    try {
      const businessListingDetail = await this.businessListingService.findOne(params.id);

      return businessListingDetail;
    } catch (error) {
      throw new HttpException(
        'Unable to create listing type',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async storeFile(locationName: string, file: any): Promise<string> {
    const storageLocation = this.storageLocationService.generateNewStorageLocationFor(
        locationName,
        file.filename,
      );

    if (this.config.get<string>('FILE_STORAGE') === 's3') {
      await this.s3StorageService.write(storageLocation, file);
    } else {
      this.localStorageService.write(storageLocation, file);
    }

    return storageLocation;
  }
}
