import {
  Body,
 Controller, HttpException, HttpStatus, Post,
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
import { BusinessListingService } from './providers/business-listing.service';
import { CreateBusinessListingDto } from './dto/create-business-listing.dto';

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
  @Post('create')
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
  async createBusinessListing(
    @Body() createFeedPostsDto: CreateBusinessListingDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
    }

    const listingImageFile = files[0];
    const castFiles = files.slice(1);

    const listingStorageLocation = this.storageLocationService.generateNewStorageLocationFor('business-listing', listingImageFile.filename);

    if (this.config.get<string>('FILE_STORAGE') === 's3') {
      await this.s3StorageService.write(listingStorageLocation, listingImageFile);
      for (const file of castFiles) {
        const castStorageLocation = this.storageLocationService.generateNewStorageLocationFor('business-listing-cast', file.filename);
        await this.s3StorageService.write(castStorageLocation, file);
      }
    } else {
      this.localStorageService.write(listingStorageLocation, listingImageFile);
      for (const file of castFiles) {
        const castStorageLocation = this.storageLocationService.generateNewStorageLocationFor('business-listing-cast', file.filename);
        this.localStorageService.write(castStorageLocation, file);
      }
    }

    const businessListing = new BusinessListing(createFeedPostsDto);
    businessListing.image = listingStorageLocation;

    const createdBusinessListing = await this.businessListingService.createBusinessListing(businessListing);

    return {
      _id: createdBusinessListing._id,
      businesstype: createdBusinessListing.businesstype,
      listingType: createdBusinessListing.listingType,
      title: createdBusinessListing.title,
      image: createdBusinessListing.image,
    };
  }
}
