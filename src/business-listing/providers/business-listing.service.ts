import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { BusinessListing, BusinessListingDocument } from '../../schemas/businessListing/businessListing.schema';
import { CreateBusinessListingDto } from '../dto/create-business-listing.dto';
import { UpdateBusinessListingDto } from '../dto/update-business-listing.dto';

@Injectable()
export class BusinessListingService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(BusinessListing.name) private businessListingModel: Model<BusinessListingDocument>,
  ) {}

  async createBusinessListing(createBusinessListingDto: CreateBusinessListingDto): Promise<BusinessListing> {
    return this.businessListingModel.create(createBusinessListingDto);
  }

  async findAll(): Promise<BusinessListing[]> {
    return this.businessListingModel.find().exec();
  }

  async findOne(id: string): Promise<BusinessListing> {
    const businessListing = await this.businessListingModel.findById(id).exec();
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
