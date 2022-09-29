import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from '../../schemas/event/event.schema';
import { EventActiveStatus } from '../../schemas/event/event.enums';

@Injectable()
export class EventService {
  constructor(@InjectModel(Event.name) private eventModel: Model<EventDocument>) { }

  async create(event: Partial<Event>) {
    return this.eventModel.create(event);
  }

  async update(id: string, eventData: Partial<Event>): Promise<EventDocument> {
    return this.eventModel
    .findOneAndUpdate({ _id: id }, eventData, { new: true })
    .exec();
  }

  async findById(id: string, activeOnly: boolean): Promise<EventDocument> {
    const eventFindQuery: any = { _id: id };
    if (activeOnly) {
      eventFindQuery.deleted = false;
      eventFindQuery.status = EventActiveStatus.Active;
    }
    return this.eventModel.findOne(eventFindQuery).exec();
  }

  async findAllByDate(startDate: Date, endDate: Date, limit: number, activeOnly: boolean): Promise<EventDocument[]> {
    const eventFindAllQuery: any = {
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    };

    if (activeOnly) {
      eventFindAllQuery.deleted = false;
      eventFindAllQuery.status = EventActiveStatus.Active;
    }
    return this.eventModel.find(eventFindAllQuery)
    .sort({ createdAt: 1 })
    .limit(limit)
    .exec();
  }
}
