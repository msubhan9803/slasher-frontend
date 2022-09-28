import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from '../../schemas/event/event.schema';

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

  async findById(id: string): Promise<EventDocument> {
    return this.eventModel.findById(id).exec();
  }

  async findAllByDate(startDate: Date, endDate: Date, limit: number): Promise<EventDocument[]> {
    return this.eventModel.find({
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    })
    .limit(limit)
    .exec();
  }
}
