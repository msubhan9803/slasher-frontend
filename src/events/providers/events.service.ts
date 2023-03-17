import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Event, EventDocument } from '../../schemas/event/event.schema';
import { EventActiveStatus } from '../../schemas/event/event.enums';
import { toUtcStartOfDay } from '../../utils/date-utils';
import { METERS_TO_MILES_MULTIPLIER } from '../../constants';

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

  async findById(id: string, activeOnly: boolean, populateField = null, populateSelect = null): Promise<EventDocument> {
    const eventFindQuery: any = { _id: id };
    if (activeOnly) {
      eventFindQuery.deleted = false;
      eventFindQuery.status = EventActiveStatus.Active;
    }
    return this.eventModel.findOne(eventFindQuery).populate(populateField, populateSelect).exec();
  }

  async findAllByDate(
    startDate: Date,
    endDate: Date,
    limit: number,
    activeOnly: boolean,
    after?: mongoose.Types.ObjectId,
  ): Promise<EventDocument[]> {
    const eventFindAllQuery: any = {
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    };
    if (activeOnly) {
      eventFindAllQuery.deleted = false;
      eventFindAllQuery.status = EventActiveStatus.Active;
    }

    if (after) {
      const afterEvent = await this.eventModel.findById(after);
      eventFindAllQuery.sortStartDate = { $gt: afterEvent.sortStartDate };
    }

    return this.eventModel.find(eventFindAllQuery)
      .sort({ sortStartDate: 1 })
      .limit(limit)
      .exec();
  }

  async findCountsByDate(
    startDate: Date,
    endDate: Date,
    activeOnly: boolean,
  ): Promise<Partial<EventDocument>[]> {
    // TODO: Determine if there's a more efficient way to do all of the logic below in a single MongoDB query.
    // This works for now though, since we don't have too many events per month and are generally only
    // searching month by month.

    const dateRangeFilter: any = {
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    };
    if (activeOnly) {
      dateRangeFilter.deleted = false;
      dateRangeFilter.status = EventActiveStatus.Active;
    }

    const events = await this.eventModel.find(dateRangeFilter).select(['id', 'startDate', 'endDate']).exec();
    if (events.length === 0) {
      return [];
    }

    // Generate array of all days within interval
    const daysToEventCounts = [];
    let lastDate = toUtcStartOfDay(startDate);
    while (lastDate <= endDate) {
      const date = new Date(lastDate);
      const nextDayDate = new Date(date.getTime() + 86400000);
      // Count events that overlap this this day
      const count = events.filter(
        (event) => (event.startDate < nextDayDate && event.endDate > date),
      ).length;
      daysToEventCounts.push({ date, count });
      lastDate = nextDayDate;
    }

    return daysToEventCounts;
  }

  // Find events in a given distance (radially)
  async findAllByDistance(
    latitude: number,
    longitude: number,
    miles: number,
    activeOnly: boolean,
  ): Promise<Array<EventDocument & { distance: number }>> {
    const query: any = {};
    if (activeOnly) {
      query.deleted = false;
      query.status = EventActiveStatus.Active;
    }

    const maxDistanceMetres = miles * 1609.344;
    const results = await this.eventModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [latitude, longitude],
          },
          maxDistance: maxDistanceMetres,
          distanceField: 'distance',
          // get distances of each event in miles
          distanceMultiplier: METERS_TO_MILES_MULTIPLIER,
        },
      },
      { $match: query },
    ]);
    return results;
  }

  // Find events in a given rectangle denotes by provided coordinates
  async findAllInRectangle(
    latitudeTopRight: number,
    longitudeTopRight: number,
    latitudeBottomLeft: number,
    longitudeBottomLeft: number,
    activeOnly: boolean,
  ): Promise<Array<EventDocument>> {
    const query: any = {
      location: {
        $geoWithin: { $box: [[latitudeTopRight, longitudeTopRight], [latitudeBottomLeft, longitudeBottomLeft]] },
      },
    };
    if (activeOnly) {
      query.deleted = false;
      query.status = EventActiveStatus.Active;
    }
    return this.eventModel.find(query);
  }
}
