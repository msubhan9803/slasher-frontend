import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsController } from './events.controller';
import { EventService } from './providers/events.service';
import { Event, EventSchema } from '../schemas/event/event.schema';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { addPrePostHooks } from '../schemas/event/event.pre-post-hooks';
import { EventCategoriesModule } from '../event-categories/event-categories.module';
import { MailModule } from '../providers/mail.module';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Event.name,
        useFactory: () => {
          const schema = EventSchema;
          addPrePostHooks(schema);
          return schema;
        },
      },
    ]),
    EventCategoriesModule,
    MailModule,
  ],
  controllers: [EventsController],
  providers: [EventService, LocalStorageService, S3StorageService],
  exports: [EventService],
})
export class EventsModule { }
