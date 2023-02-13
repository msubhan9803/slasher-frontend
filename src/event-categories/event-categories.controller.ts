import {
  Controller, Get,
} from '@nestjs/common';
import { pick } from '../utils/object-utils';
import { EventCategoriesService } from './providers/event-categories.service';

@Controller('event-categories')
export class EventCategoriesController {
  constructor(
    private readonly eventCategoriesService: EventCategoriesService,
  ) { }

  @Get()
  async index() {
    const eventCategoryList = await this.eventCategoriesService.findAll(true);
    return eventCategoryList.map(
      (eventCategory) => pick(eventCategory, ['_id', 'event_name']),
    );
  }
}
