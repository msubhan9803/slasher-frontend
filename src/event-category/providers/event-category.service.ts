import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventCategory, EventCategoryDocument } from '../../schemas/eventCategory/eventCategory.schema';

@Injectable()
export class EventCategoryService {
  constructor(@InjectModel(EventCategory.name) private eventCategoryModel: Model<EventCategoryDocument>) { }

  async create(event: Partial<EventCategory>) {
    return this.eventCategoryModel.create(event);
  }
}
