import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventCategoryController } from './event-category.controller';
import { EventCategoryService } from './providers/event-category.service';
import { EventCategory, EventCategorySchema } from '../schemas/eventCategory/eventCategory.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EventCategory.name, schema: EventCategorySchema }]),
  ],
  controllers: [EventCategoryController],
  providers: [EventCategoryService],
  exports: [EventCategoryService],
})
export class EventCategoryModule { }
