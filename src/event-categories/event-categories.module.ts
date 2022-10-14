import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventCategoriesController } from './event-categories.controller';
import { EventCategoriesService } from './providers/event-categories.service';
import { EventCategory, EventCategorySchema } from '../schemas/eventCategory/eventCategory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EventCategory.name, schema: EventCategorySchema }]),
  ],
  controllers: [EventCategoriesController],
  providers: [EventCategoriesService],
  exports: [EventCategoriesService],
})
export class EventCategoriesModule { }
