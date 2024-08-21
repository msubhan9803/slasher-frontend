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
  Put,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { UserType } from 'src/schemas/user/user.enums';
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
  FileType,
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
import { UpdateBusinessListingDto } from './dto/update-business-listing.dto';
import { UpdateBusinessListingImageCoverDto } from './dto/update-business-listing-image-cover.dto';
import { ToggleListingStatusDto } from './dto/toggle-listing-status.dto';

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

  adminOnlyApiRestrictionMessage = 'Only admins can access this API';

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
      const castFiles = files.slice(1); // Second onwards (in-case of movies) are cast files for listing type === movies
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

      const currentListingByBusinessType = await this.businessListingService.getAllListings(businesstype);

      const businessListing = new BusinessListing({
        userRef: user._id,
        businesstype,
        listingType,
        isActive,
      });

      if (![BusinessType.BOOKS, BusinessType.MOVIES].includes(businesstype)) {
        businessListing.title = title;
        businessListing.overview = overview;
        businessListing.email = email;
        businessListing.phoneNumber = phoneNumber;
        businessListing.address = address;
        businessListing.websiteLink = websiteLink;
        businessListing.businessLogo = listingStorageLocation;
        businessListing.coverPhoto = await this.storeFile(
          'business-listing',
          coverPhotoFile,
        );
      }

      let createdBusinessListing = await this.businessListingService.createListing(businessListing);

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
            businessListingRef: createdBusinessListing._id.toString(),
          });

          businessListing.bookRef = book._id;
          createdBusinessListing = await this.businessListingService.updateAll(createdBusinessListing._id.toString(), businessListing);

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
            businessListingRef: createdBusinessListing._id.toString(),
            movieDBId: currentListingByBusinessType.length,
          });

          businessListing.movieRef = movie._id;
          createdBusinessListing = await this.businessListingService.updateAll(createdBusinessListing._id.toString(), businessListing);

          break;

          default:
          break;
      }

      return createdBusinessListing;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @TransformImageUrls('$.image')
  @Put('update-listing')
  async updateListing(
    @Body() updatingBusienssListingDto: UpdateBusinessListingDto,
  ) {
    try {
      const {
        bookRef,
        movieRef,
        businesstype,
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
        trailerLinks,
      } = updatingBusienssListingDto;

      switch (businesstype) {
        case BusinessType.BOOKS:
          await this.booksService.updateBook(
          bookRef,
          {
            name: title,
            author: [author],
            numberOfPages: pages,
            isbnNumber: [isbn],
            description: overview,
            status: BookActiveStatus.Active,
            publishDate: new Date(yearReleased, 0),
            buyUrl: link,
          },
        );
        break;

        case BusinessType.MOVIES:
          await this.moviesService.updateMovie(
            movieRef,
            {
            name: title,
            descriptions: overview,
            trailerUrls: Object.values(trailerLinks).map(
              (trailer: string) => trailer,
            ),
            countryOfOrigin,
            durationInMinutes,
            rating: officialRatingReceived,
            releaseDate: new Date(yearReleased, 0),
            status: MovieActiveStatus.Active,
            watchUrl: link,
          },
        );
        break;

        default:
          await this.businessListingService.update(updatingBusienssListingDto._id, updatingBusienssListingDto);
          break;
      }

      const updatedBusinessListing = await this.businessListingService.findOneWithoutStatusCondition(updatingBusienssListingDto._id);

      return updatedBusinessListing;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('update-listing-thumbnail-or-cover-photo')
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
  async updateListingThumbnailOrCoverPhoto(
    @Req() request: Request,
    @Body() updateBusinessListingImageCoverDto: UpdateBusinessListingImageCoverDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    try {
      if (!files || files.length === 0) {
        throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
      }

      const { listingId, type, listingType } = updateBusinessListingImageCoverDto;
      const fileObj = files[0];

      const listingStorageLocation = await this.storeFile(
        'business-listing',
        fileObj,
      );

      const listingDetail: any = await this.businessListingService.findOneWithoutStatusCondition(listingId);

      const payload: any = {};

      switch (listingType) {
        case BusinessType.BOOKS:
          await this.booksService.updateBook(
            listingDetail.bookRef._id,
            {
              coverImage: {
                image_path: listingStorageLocation,
                description: '',
              },
            },
          );
          break;

        case BusinessType.MOVIES:
          await this.moviesService.updateMovie(
            listingDetail.movieRef._id,
            {
              movieImage: listingStorageLocation,
            },
          );
          break;

        default:
          if (type === FileType.THUMBNAIL) {
            payload.businessLogo = listingStorageLocation;
          } else {
            payload.coverPhoto = listingStorageLocation;
          }
          break;
      }

      const updatedBusinessListing = await this.businessListingService.update(listingId, payload as UpdateBusinessListingDto);

      return updatedBusinessListing;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @TransformImageUrls('$.image')
  @Put('toggle-listing-status')
  async toggleListingStatus(
    @Body() toggleListingStatusDto: ToggleListingStatusDto,
  ) {
    try {
      const { listingId, businessType } = toggleListingStatusDto;

      const listingDetail: any = await this.businessListingService.findOneWithoutStatusCondition(listingId);
      const currentListingStatus = listingDetail.isActive;
      const currentBookStatus = listingDetail?.bookRef?.status;
      const currentMovieStatus = listingDetail?.movieRef?.status;

      switch (businessType) {
        case BusinessType.BOOKS:
          await this.booksService.updateBook(
            listingDetail.bookRef._id,
          {
            status: currentBookStatus === BookActiveStatus.Active ? BookActiveStatus.Inactive : BookActiveStatus.Active,
          },
        );
        break;

        case BusinessType.MOVIES:
          await this.moviesService.updateMovie(
            listingDetail.movieRef._id,
            {
            status: currentMovieStatus === MovieActiveStatus.Active ? MovieActiveStatus.Inactive : MovieActiveStatus.Active,
          },
        );
        break;

        default:
          break;
      }

      const updatedListing = await this.businessListingService.update(listingId, { isActive: !currentListingStatus });

      return updatedListing;
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

  @TransformImageUrls('$[*].businessLogo')
  @Get('get-all-listings-admin')
  async getAllListingsForAdmin(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: GetAllListingsDto,
  ) {
    try {
      const user = getUserFromRequest(request);
      const isAdmin = user.userType === UserType.Admin;
      if (!isAdmin) {
        throw new HttpException(this.adminOnlyApiRestrictionMessage, HttpStatus.NOT_FOUND);
      }

      const businessListings = await this.businessListingService.getAllListingsForAdmin(query.businesstype);

      return businessListings;
    } catch (error) {
      throw new HttpException(
        'Unable to create listing type',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @TransformImageUrls(
    '$.movies[*].movieRef.movieImage',
    '$.books[*].bookRef.coverImage.image_path',
    '$.podcaster[*].businessLogo',
    '$.artist[*].businessLogo',
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
        'Unable to fetch listing details',
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
