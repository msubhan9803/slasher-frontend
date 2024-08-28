import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { BusinessListing, BusinessListingDocument } from '../../schemas/businessListing/businessListing.schema';
import { UpdateBusinessListingDto } from '../dto/update-business-listing.dto';

@Injectable()
export class BusinessListingService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(BusinessListing.name) private businessListingModel: Model<BusinessListingDocument>,
  ) {}

  async createListing(createBusinessListingDto: Partial<BusinessListing>): Promise<BusinessListing> {
    return this.businessListingModel.create(createBusinessListingDto);
  }

  async getAllListings(businesstype: string, limit?: number, after?: string): Promise<BusinessListing[]> {
    const getAllListingsQuery: any = { isActive: true };

    if (businesstype) {
      getAllListingsQuery.businesstype = businesstype;
    }

    let query = this.businessListingModel
      .find(getAllListingsQuery)
      .sort({ createdAt: -1 });

    if (after) {
      const lastDocument = await this.businessListingModel.findById(after) as any;
      if (lastDocument) {
        query = query.find({ createdAt: { $lt: lastDocument.createdAt } });
      }
    }

    if (limit) {
      query = query.limit(limit);
    }

    return query.exec();
  }

  async getAllListingsForAdmin(businesstype: string): Promise<BusinessListing[]> {
    let getAllListingsQuery = {};

    if (businesstype) {
      getAllListingsQuery = {
        businesstype,
      };
    }

    return this.businessListingModel.find(getAllListingsQuery).populate('bookRef movieRef userRef').exec();
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

  async findOne(id: string): Promise<BusinessListing> {
    const businessListing = await this.businessListingModel.findById(id).populate('bookRef movieRef userRef').exec();
    if (!businessListing) {
      throw new NotFoundException(`Business listing with ID ${id} not found`);
    }
    if (!businessListing.isActive) {
      throw new BadRequestException(`Business listing with ID ${id} not found`);
    }
    return businessListing;
  }

  async findOneWithoutStatusCondition(id: string): Promise<BusinessListing> {
    const businessListing = await this.businessListingModel.findById(id).populate('bookRef movieRef').exec();
    if (!businessListing) {
      throw new NotFoundException(`Business listing with ID ${id} not found`);
    }
    return businessListing;
  }

  async update(id: string, updateBusinessListingDto: Partial<UpdateBusinessListingDto>): Promise<BusinessListing> {
    const existingBusinessListing = await this.businessListingModel.findByIdAndUpdate(id, updateBusinessListingDto, { new: true }).exec();
    if (!existingBusinessListing) {
      throw new NotFoundException(`Business listing with ID ${id} not found`);
    }
    return existingBusinessListing;
  }

  async updateAll(id: string, businessListingData: BusinessListing): Promise<BusinessListing> {
    const existingBusinessListing = await this.businessListingModel.findByIdAndUpdate(id, businessListingData, { new: true }).exec();
    if (!existingBusinessListing) {
      throw new NotFoundException(`Business listing with ID ${id} not found`);
    }
    return existingBusinessListing;
  }
}
