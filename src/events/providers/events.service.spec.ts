import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { EventService } from './events.service';
import { EventDocument } from '../../schemas/event/event.schema';
import { eventsFactory } from '../../../test/factories/events.factory';
import { userFactory } from '../../../test/factories/user.factory';
import { UserDocument } from '../../schemas/user/user.schema';
import { UsersService } from '../../users/providers/users.service';
import { EventCategoryService } from '../../event-category/providers/event-category.service';
import { eventCategoryFactory } from '../../../test/factories/event-category.factory';
import { EventCategoryDocument } from '../../schemas/eventCategory/eventCategory.schema';

describe('EventService', () => {
  let app: INestApplication;
  let connection: Connection;
  let eventService: EventService;
  let usersService: UsersService;
  let eventCategoryService: EventCategoryService;
  let userData: Partial<UserDocument>;
  let eventCategoryData: Partial<EventCategoryDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    eventService = moduleRef.get<EventService>(EventService);
    usersService = moduleRef.get<UsersService>(UsersService);
    eventCategoryService = moduleRef.get<EventCategoryService>(EventCategoryService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();

    userData = await usersService.create(userFactory.build());
    eventCategoryData = await eventCategoryService.create(eventCategoryFactory.build());
  });

  it('should be defined', () => {
    expect(eventService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a event', async () => {
      const eventData = eventsFactory.build(
        {
          userId: userData._id,
          event_type: eventCategoryData._id,
        },
      );
      const event = await eventService.create(eventData);
      expect(await eventService.findById(event._id)).toBeTruthy();
    });
  });

  describe('#update', () => {
    let event: EventDocument;
    beforeEach(async () => {
      event = await eventService.create(
        eventsFactory.build(
          {
            userId: userData._id,
            event_type: eventCategoryData._id,
          },
        ),
      );
    });
    it('finds the expected event and update the details', async () => {
      const eventData = {
        name: 'Event test 20',
        author: 'Event new author',
      };
      const updatedEvent = await eventService.update(event._id, eventData);
      const reloadedEvent = await eventService.findById(updatedEvent._id);
      expect(reloadedEvent.name).toEqual(eventData.name);
      expect(reloadedEvent.author).toEqual(eventData.author);
      expect(reloadedEvent.city).toEqual(event.city);
    });
  });

  describe('#findById', () => {
    let event: EventDocument;
    beforeEach(async () => {
      event = await eventService.create(
        eventsFactory.build(
          {
            userId: userData._id,
            event_type: eventCategoryData._id,
          },
        ),
      );
    });
    it('finds the expected event details', async () => {
      const reloadedEvent = await eventService.findById(event._id);
      expect(reloadedEvent.name).toEqual(event.name);
    });
  });

  describe('#findAllByDate', () => {
    let event: EventDocument;
    beforeEach(async () => {
      event = await eventService.create(
        eventsFactory.build(
          {
            userId: userData._id,
            event_type: eventCategoryData._id,
          },
        ),
      );
      for (let index = 0; index < 10; index += 1) {
        await eventService.create(
          eventsFactory.build(
            {
              userId: userData._id,
              event_type: eventCategoryData._id,
            },
          ),
        );
      }
    });
    it('finds all the expected event details', async () => {
      const reloadedEvent = await eventService.findAllByDate(event.startDate, event.endDate, 5);
      expect(reloadedEvent.length).toBeLessThanOrEqual(5);
    });
  });
});
