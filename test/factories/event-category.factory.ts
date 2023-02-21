import { Factory } from 'fishery';
import { EventCategory } from '../../src/schemas/eventCategory/eventCategory.schema';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

export const eventCategoryFactory = Factory.define<Partial<EventCategory>>(
  ({ sequence }) => new EventCategory({
    event_name: `Event category ${sequence}`,
  }),
);

addFactoryToRewindList(eventCategoryFactory);
