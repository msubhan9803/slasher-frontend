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
import { EventCategoriesService } from '../../event-categories/providers/event-categories.service';
import { eventCategoryFactory } from '../../../test/factories/event-category.factory';
import { EventCategoryDocument } from '../../schemas/eventCategory/eventCategory.schema';
import { EventActiveStatus } from '../../schemas/event/event.enums';

describe('EventService', () => {
  let app: INestApplication;
  let connection: Connection;
  let eventService: EventService;
  let usersService: UsersService;
  let eventCategoriesService: EventCategoriesService;
  let userData: Partial<UserDocument>;
  let eventCategoryData: Partial<EventCategoryDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    eventService = moduleRef.get<EventService>(EventService);
    usersService = moduleRef.get<UsersService>(UsersService);
    eventCategoriesService = moduleRef.get<EventCategoriesService>(EventCategoriesService);

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
    eventCategoryData = await eventCategoriesService.create(eventCategoryFactory.build());
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
      expect(await eventService.findById(event._id, false)).toBeTruthy();
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
      const reloadedEvent = await eventService.findById(updatedEvent._id, false);
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
      const eventDetails = await eventService.findById(event._id, false);
      expect(eventDetails.name).toEqual(event.name);
    });

    it('finds the expected event category details that has not deleted and active status', async () => {
      const activeEvent = await eventService.create(
        eventsFactory.build({
          status: EventActiveStatus.Active,
          userId: userData._id,
          event_type: eventCategoryData._id,
        }),
      );

      const eventDetail = await eventService.findById(activeEvent._id, true);
      expect(eventDetail.name).toEqual(activeEvent.name);
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
      for (let index = 0; index < 5; index += 1) {
        await eventService.create(
          eventsFactory.build(
            {
              userId: userData._id,
              event_type: eventCategoryData._id,
            },
          ),
        );
        await eventService.create(
          eventsFactory.build(
            {
              userId: userData._id,
              event_type: eventCategoryData._id,
              status: EventActiveStatus.Active,
            },
          ),
        );
      }
    });
    it('finds all the expected event details', async () => {
      const eventList = await eventService.findAllByDate(event.startDate, event.endDate, 10, false);
      expect(eventList).toHaveLength(10);
    });

    it('finds all the expected event details that has not deleted and active status', async () => {
      const eventList = await eventService.findAllByDate(event.startDate, event.endDate, 10, true);
      expect(eventList).toHaveLength(5);
    });

    describe('when `after` argument is supplied', () => {
      it('returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResults = await eventService.findAllByDate(event.startDate, event.endDate, limit, true);
        const secondResults = await eventService.findAllByDate(event.startDate, event.endDate, limit, true, firstResults[limit - 1].id);
        expect(firstResults).toHaveLength(3);
        expect(secondResults).toHaveLength(2);
        // Last result in first set should have earlier sortStartDate value than first result of second set
        expect(firstResults[limit - 1].sortStartDate.localeCompare(secondResults[0].sortStartDate)).toBe(-1);
      });
    });
  });
});
