import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventCategory, EventCategoryDocument } from '../../schemas/eventCategory/eventCategory.schema';
import { EventCategoryDeletionState, EventCategoryStatus } from '../../schemas/eventCategory/eventCategory.enums';

@Injectable()
export class EventCategoriesService {
  constructor(@InjectModel(EventCategory.name) private eventCategoryModel: Model<EventCategoryDocument>) { }

  async create(event: Partial<EventCategory>) {
    return this.eventCategoryModel.create(event);
  }

  async update(id: string, eventCategoryData: Partial<EventCategory>): Promise<EventCategoryDocument> {
    return this.eventCategoryModel
    .findOneAndUpdate({ _id: id }, eventCategoryData, { new: true })
    .exec();
  }

  async findById(id: string, activeOnly: boolean): Promise<EventCategory> {
    const eventCategoryFindQuery: any = { _id: id };
    if (activeOnly) {
      eventCategoryFindQuery.is_deleted = EventCategoryDeletionState.NotDeleted;
      eventCategoryFindQuery.status = EventCategoryStatus.Active;
    }
    return this.eventCategoryModel.findOne(eventCategoryFindQuery).exec();
  }

  async findAll(activeOnly: boolean): Promise<EventCategoryDocument[]> {
    const eventCategoryFindAllQuery: any = {};
    if (activeOnly) {
      eventCategoryFindAllQuery.is_deleted = EventCategoryDeletionState.NotDeleted;
      eventCategoryFindAllQuery.status = EventCategoryStatus.Active;
    }
    return this.eventCategoryModel.find(eventCategoryFindAllQuery).exec();
  }
}
