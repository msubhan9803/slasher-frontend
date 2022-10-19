import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { DateTime } from 'luxon';
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

  const activeEventData = [
    { start: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-17T23:59:59Z').toJSDate() },
    { start: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-18T23:59:59Z').toJSDate() },
    { start: DateTime.fromISO('2022-10-18T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-18T23:59:59Z').toJSDate() },
    { start: DateTime.fromISO('2022-10-18T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-20T23:59:59Z').toJSDate() },
    { start: DateTime.fromISO('2022-10-19T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-21T23:59:59Z').toJSDate() },
  ];
  const inactiveEventData = [
    { start: DateTime.fromISO('2022-10-18T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-18T23:59:59Z').toJSDate() },
  ];
  const deactivatedEventData = [
    { start: DateTime.fromISO('2022-10-18T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-19T23:59:59Z').toJSDate() },
  ];

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

    it('finds the expected event details with event category populate', async () => {
      const eventDetails = await eventService.findById(event._id, false, 'event_type', 'event_name');
      const eventCategoryDetail = await eventCategoriesService.findById(event.event_type.toString(), true);

      expect(eventDetails.event_type._id).toEqual(eventCategoryDetail._id);
      expect(eventDetails.event_type.event_name).toEqual(eventCategoryDetail.event_name);
    });

    it('finds the expected event details that has not deleted and active status', async () => {
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

    it('finds the expected event details with event category populate that has not deleted and active status', async () => {
      const activeEvent = await eventService.create(
        eventsFactory.build({
          status: EventActiveStatus.Active,
          userId: userData._id,
          event_type: eventCategoryData._id,
        }),
      );

      const eventDetail = await eventService.findById(activeEvent._id, true, 'event_type', 'event_name');
      const eventCategoryDetail = await eventCategoriesService.findById(activeEvent.event_type.toString(), true);

      expect(eventDetail.event_type._id).toEqual(eventCategoryDetail._id);
      expect(eventDetail.event_type.event_name).toEqual(eventCategoryDetail.event_name);
    });
  });

  describe('#findAllByDate', () => {
    const startDateForSearch = DateTime.fromISO('2022-10-18T00:00:00Z').toJSDate();
    const endDateForSearch = DateTime.fromISO('2022-10-18T23:59:59Z').toJSDate();
    beforeEach(async () => {
      for (const eventDateRange of activeEventData) {
        await eventService.create(
          eventsFactory.build(
            {
              userId: userData._id,
              event_type: eventCategoryData._id,
              startDate: eventDateRange.start,
              endDate: eventDateRange.end,
              status: EventActiveStatus.Active,
            },
          ),
        );
      }
      for (const eventDateRange of inactiveEventData) {
        await eventService.create(
          eventsFactory.build(
            {
              userId: userData._id,
              event_type: eventCategoryData._id,
              startDate: eventDateRange.start,
              endDate: eventDateRange.end,
              status: EventActiveStatus.Inactive,
            },
          ),
        );
      }
      for (const eventDateRange of deactivatedEventData) {
        await eventService.create(
          eventsFactory.build(
            {
              userId: userData._id,
              event_type: eventCategoryData._id,
              startDate: eventDateRange.start,
              endDate: eventDateRange.end,
              status: EventActiveStatus.Deactivated,
            },
          ),
        );
      }
    });
    it('finds all the expected event details', async () => {
      const eventList = await eventService.findAllByDate(startDateForSearch, endDateForSearch, 10, false);
      for (let index = 1; index < eventList.length; index += 1) {
        expect(eventList[index - 1].sortStartDate < eventList[index].sortStartDate).toBe(true);
      }
      expect(eventList).toHaveLength(5);
    });

    it('finds all the expected event details that has not deleted and active status', async () => {
      const eventList = await eventService.findAllByDate(startDateForSearch, endDateForSearch, 10, true);
      for (let index = 1; index < eventList.length; index += 1) {
        expect(eventList[index - 1].sortStartDate < eventList[index].sortStartDate).toBe(true);
      }
      expect(eventList).toHaveLength(3);
    });

    describe('when `after` argument is supplied', () => {
      it('returns the first and second sets of paginated results', async () => {
        const limit = 2;
        const firstResults = await eventService.findAllByDate(startDateForSearch, endDateForSearch, limit, true);
        const secondResults = await eventService.findAllByDate(
          startDateForSearch,
          endDateForSearch,
          limit,
          true,
          firstResults[limit - 1].id,
        );
        expect(firstResults).toHaveLength(2);
        expect(secondResults).toHaveLength(1);
        // Last result in first set should have earlier sortStartDate value than first result of second set
        expect(firstResults[limit - 1].sortStartDate.localeCompare(secondResults[0].sortStartDate)).toBe(-1);
      });
    });
  });

  describe('#findCountsByDate', () => {
    const startDateForSearch = DateTime.fromISO('2022-10-16T00:00:00Z').toJSDate();
    const endDateForSearch = DateTime.fromISO('2022-10-22T23:59:59Z').toJSDate();
    beforeEach(async () => {
      for (const eventDateRange of activeEventData) {
        await eventService.create(
          eventsFactory.build(
            {
              userId: userData._id,
              event_type: eventCategoryData._id,
              startDate: eventDateRange.start,
              endDate: eventDateRange.end,
              status: EventActiveStatus.Active,
            },
          ),
        );
      }
      for (const eventDateRange of inactiveEventData) {
        await eventService.create(
          eventsFactory.build(
            {
              userId: userData._id,
              event_type: eventCategoryData._id,
              startDate: eventDateRange.start,
              endDate: eventDateRange.end,
              status: EventActiveStatus.Inactive,
            },
          ),
        );
      }
      for (const eventDateRange of deactivatedEventData) {
        await eventService.create(
          eventsFactory.build(
            {
              userId: userData._id,
              event_type: eventCategoryData._id,
              startDate: eventDateRange.start,
              endDate: eventDateRange.end,
              status: EventActiveStatus.Deactivated,
            },
          ),
        );
      }
    });
    it('returns the expected counts for active events', async () => {
      const countResults = await eventService.findCountsByDate(startDateForSearch, endDateForSearch, true);
      expect(countResults).toEqual([
        {
          date: new Date('2022-10-16T00:00:00.000Z'),
          count: 0,
        },
        {
          date: new Date('2022-10-17T00:00:00.000Z'),
          count: 2,
        },
        {
          date: new Date('2022-10-18T00:00:00.000Z'),
          count: 3,
        },
        {
          date: new Date('2022-10-19T00:00:00.000Z'),
          count: 2,
        },
        {
          date: new Date('2022-10-20T00:00:00.000Z'),
          count: 2,
        },
        {
          date: new Date('2022-10-21T00:00:00.000Z'),
          count: 1,
        },
        {
          date: new Date('2022-10-22T00:00:00.000Z'),
          count: 0,
        },
      ]);
    });
    it('returns the expected counts for active and inactive events', async () => {
      const countResults = await eventService.findCountsByDate(startDateForSearch, endDateForSearch, false);
      expect(countResults).toEqual([
        {
          date: new Date('2022-10-16T00:00:00.000Z'),
          count: 0,
        },
        {
          date: new Date('2022-10-17T00:00:00.000Z'),
          count: 2,
        },
        {
          date: new Date('2022-10-18T00:00:00.000Z'),
          count: 5,
        },
        {
          date: new Date('2022-10-19T00:00:00.000Z'),
          count: 3,
        },
        {
          date: new Date('2022-10-20T00:00:00.000Z'),
          count: 2,
        },
        {
          date: new Date('2022-10-21T00:00:00.000Z'),
          count: 1,
        },
        {
          date: new Date('2022-10-22T00:00:00.000Z'),
          count: 0,
        },
      ]);
    });
  });
});
