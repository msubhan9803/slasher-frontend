/* eslint-disable max-len */
import {
  Body,
 Controller, Get, HttpException, HttpStatus, Post,
 UploadedFiles,
 UseInterceptors,
} from '@nestjs/common';
import { generateFileUploadInterceptors } from 'src/app/interceptors/file-upload-interceptors';
import { UPLOAD_PARAM_NAME_FOR_FILES, MAXIMUM_IMAGE_UPLOAD_SIZE, MAX_ALLOWED_UPLOAD_FILE_FOR_BUSINESS_LISTING } from 'src/constants';
import { defaultFileInterceptorFileFilter } from 'src/utils/file-upload-utils';
import { StorageLocationService } from 'src/global/providers/storage-location.service';
import { LocalStorageService } from 'src/local-storage/providers/local-storage.service';
import { S3StorageService } from 'src/local-storage/providers/s3-storage.service';
import { BusinessListing } from 'src/schemas/businessListing/businessListing.schema';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { TransformImageUrls } from 'src/app/decorators/transform-image-urls.decorator';
import { BusinessListingType } from 'src/schemas/businessListingType/businessListingType.schema';
import { Cast, TrailerLinks } from 'src/schemas/businessListing/businessListing.enums';
import { BusinessListingService } from './providers/business-listing.service';
import { CreateBusinessListingDto } from './dto/create-business-listing.dto';
import { CreateBusinessListingTypeDto } from './dto/create-business-listing-type.dto';

@Controller({ path: 'business-listing', version: ['1'] })
export class BusinessListingController {
  constructor(
    private readonly businessListingService: BusinessListingService,
    private readonly config: ConfigService,
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
    private readonly storageLocationService: StorageLocationService,
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
    @Body() createBusienssListingDto: CreateBusinessListingDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    try {
      if (!files || files.length === 0) {
        throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
      }

      const casts: Cast = JSON.parse(createBusienssListingDto.casts ?? '[]');
      const trailerLinks: TrailerLinks = JSON.parse(createBusienssListingDto.trailerLinks ?? '{}');

      const listingImageFile = files[0]; // first file is always listing image
      const castFiles = files.slice(1); // after first file, there's going to be casts images

      const listingStorageLocation = await this.storeFile('business-listing', listingImageFile);

      if (casts.length > 0) {
        for (const [index, file] of castFiles.entries()) {
          const castImageLocation = await this.storeFile('business-listing-cast', file);
          casts[index].castImage = castImageLocation;
        }
      }

      const businessListing = new BusinessListing({
        ...createBusienssListingDto,
        casts,
        trailerLinks,
        image: listingStorageLocation,
      });

     if (createBusienssListingDto.pages) {
      businessListing.pages = createBusienssListingDto?.pages;
     }

      const createdBusinessListing = await this.businessListingService.createListing(businessListing);

      return {
        _id: createdBusinessListing._id,
        businesstype: createdBusinessListing.businesstype,
        listingType: createdBusinessListing.listingType,
        title: createdBusinessListing.title,
        image: createdBusinessListing.image,
      };
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
      throw new HttpException('Unable to create listing type', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('get-all-listing-types')
  async getAllListingType() {
    try {
      const businessListings = await this.businessListingService.getAllListingTypes();

      return businessListings;
    } catch (error) {
      throw new HttpException('Unable to create listing type', HttpStatus.BAD_REQUEST);
    }
  }

  private async storeFile(locationName: string, file: any): Promise<string> {
    const storageLocation = this.storageLocationService.generateNewStorageLocationFor(locationName, file.filename);

    if (this.config.get<string>('FILE_STORAGE') === 's3') {
      await this.s3StorageService.write(storageLocation, file);
    } else {
      this.localStorageService.write(storageLocation, file);
    }

    return storageLocation;
  }
}
