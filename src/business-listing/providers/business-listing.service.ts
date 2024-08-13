import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { BusinessListingType, BusinessListingTypeDocument } from '../../schemas/businessListingType/businessListingType.schema';
import { BusinessListing, BusinessListingDocument } from '../../schemas/businessListing/businessListing.schema';
import { UpdateBusinessListingDto } from '../dto/update-business-listing.dto';
import { CreateBusinessListingTypeDto } from '../dto/create-business-listing-type.dto';

@Injectable()
export class BusinessListingService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(BusinessListing.name) private businessListingModel: Model<BusinessListingDocument>,
    @InjectModel(BusinessListingType.name) private businessListingTypeModel: Model<BusinessListingTypeDocument>,
  ) {}

  async createListing(createBusinessListingDto: Partial<BusinessListing>): Promise<BusinessListing> {
    return this.businessListingModel.create(createBusinessListingDto);
  }

  async createListingType(createBusinessListingDto: CreateBusinessListingTypeDto): Promise<BusinessListingType> {
    return this.businessListingTypeModel.create(createBusinessListingDto);
  }

  async getAllListings(businesstype: string): Promise<BusinessListing[]> {
    let getAllListingsQuery = {};

    if (businesstype) {
      getAllListingsQuery = {
        businesstype,
      };
    }

    return this.businessListingModel.find(getAllListingsQuery).exec();
  }

  async getAllMyListings(userRef: string): Promise<BusinessListing[]> {
    let getAllMyListingsQuery = {};

    if (userRef) {
      getAllMyListingsQuery = {
        userRef,
      };
    }

    return this.businessListingModel.find(getAllMyListingsQuery).populate('bookRef movieRef').exec();
  }

  async getAllListingTypes(): Promise<BusinessListingType[]> {
    return this.businessListingTypeModel.find().exec();
  }

  async findOne(id: string): Promise<BusinessListing> {
    const businessListing = await this.businessListingModel.findById(id).populate('bookRef movieRef').exec();
    if (!businessListing) {
      throw new NotFoundException(`Business listing with ID ${id} not found`);
    }
    return businessListing;
  }

  async update(id: string, updateBusinessListingDto: UpdateBusinessListingDto): Promise<BusinessListing> {
    const existingBusinessListing = await this.businessListingModel.findByIdAndUpdate(id, updateBusinessListingDto, { new: true }).exec();
    if (!existingBusinessListing) {
      throw new NotFoundException(`Business listing with ID ${id} not found`);
    }
    return existingBusinessListing;
  }
}
