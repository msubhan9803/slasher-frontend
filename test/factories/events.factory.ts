import { Factory } from 'fishery';
import { DateTime } from 'luxon';
import { Event } from '../../src/schemas/event/event.schema';

export const eventsFactory = Factory.define<Partial<Event>>(
  ({ sequence }) => new Event({
    name: `Event name ${sequence}`,
    startDate: DateTime.now().minus({ days: sequence }).toJSDate(),
    endDate: DateTime.now().plus({ days: sequence }).toJSDate(),
    country: 'USA',
    state: 'California',
    city: 'Los Angeles',
    event_info: `Event info organised by ${sequence}`,
    url: 'https://example.com',
    author: 'test',
    images: [
      'http://localhost:4444/placeholders/default_user_icon.png',
      'http://localhost:4444/placeholders/default_user_icon.png',
    ],
  }),
);
