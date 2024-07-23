import {
  Body,
 Controller, Post,
} from '@nestjs/common';
import { BusinessListingService } from './providers/business-listing.service';
import { CreateBusinessListingDto } from './dto/create-business-listing.dto';

@Controller({ path: 'business-listing', version: ['1'] })
export class BusinessListingController {
  constructor(
    private readonly businessListingService: BusinessListingService,
  ) {}

  @Post('create')
  async createBusinessListing(
    @Body() createFeedPostsDto: CreateBusinessListingDto,
  ) {
    const businessListing = await this.businessListingService.createBusinessListing(createFeedPostsDto);

    return {
      _id: businessListing._id,
      businesstype: businessListing.businesstype,
      listingType: businessListing.listingType,
      title: businessListing.title,
    };
  }
}
