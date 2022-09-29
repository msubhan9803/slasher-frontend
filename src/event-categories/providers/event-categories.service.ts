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
    const eventFindQuery: any = { _id: id };
    if (activeOnly) {
      eventFindQuery.is_deleted = EventCategoryDeletionState.NotDeleted;
      eventFindQuery.status = EventCategoryStatus.Active;
    }
    return this.eventCategoryModel.findOne(eventFindQuery).exec();
  }

  async findAll(activeOnly: boolean): Promise<EventCategoryDocument[]> {
    const eventFindAllQuery: any = {};
    if (activeOnly) {
      eventFindAllQuery.is_deleted = EventCategoryDeletionState.NotDeleted;
      eventFindAllQuery.status = EventCategoryStatus.Active;
    }
    return this.eventCategoryModel.find(eventFindAllQuery).exec();
  }
}
