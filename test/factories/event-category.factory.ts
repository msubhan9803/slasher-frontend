import { Factory } from 'fishery';
import { EventCategory } from '../../src/schemas/eventCategory/eventCategory.schema';

export const eventCategoryFactory = Factory.define<Partial<EventCategory>>(
  ({ sequence }) => new EventCategory({
    event_name: `Event category ${sequence}`,
  }),
);
