import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { EventService } from '../../../../../src/events/providers/events.service';
import { EventCategoriesService } from '../../../../../src/event-categories/providers/event-categories.service';
import { eventCategoryFactory } from '../../../../factories/event-category.factory';
import { eventsFactory } from '../../../../factories/events.factory';
import { EventCategory } from '../../../../../src/schemas/eventCategory/eventCategory.schema';
import { EventActiveStatus } from '../../../../../src/schemas/event/event.enums';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';

describe('Event counts by date range / (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let eventService: EventService;
  let eventCategoriesService: EventCategoriesService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let eventCategory: EventCategory;
  let configService: ConfigService;

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

  const startDateForSearch = DateTime.fromISO('2022-10-16', { setZone: true }).toJSDate();
  const endDateForSearch = DateTime.fromISO('2022-10-22', { setZone: true }).toJSDate();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    eventService = moduleRef.get<EventService>(EventService);
    eventCategoriesService = moduleRef.get<EventCategoriesService>(EventCategoriesService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    activeUser = await usersService.create(userFactory.build());
    eventCategory = await eventCategoriesService.create(eventCategoryFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    for (const eventDateRange of activeEventData) {
      await eventService.create(
        eventsFactory.build(
          {
            userId: activeUser._id,
            event_type: eventCategory,
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
            userId: activeUser._id,
            event_type: eventCategory,
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
            userId: activeUser._id,
            event_type: eventCategory,
            startDate: eventDateRange.start,
            endDate: eventDateRange.end,
            status: EventActiveStatus.Deactivated,
          },
        ),
      );
    }
  });

  describe('GET /api/v1/events/by-date-range/counts', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/events/by-date-range/counts').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Returns the expected results', () => {
      it('get expected event counts data based on startDate through endDate range', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/by-date-range/counts?startDate=${startDateForSearch}&endDate=${endDateForSearch}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual([
          {
            date: '2022-10-16T00:00:00.000Z',
            count: 0,
          },
          {
            date: '2022-10-17T00:00:00.000Z',
            count: 2,
          },
          {
            date: '2022-10-18T00:00:00.000Z',
            count: 3,
          },
          {
            date: '2022-10-19T00:00:00.000Z',
            count: 2,
          },
          {
            date: '2022-10-20T00:00:00.000Z',
            count: 2,
          },
          {
            date: '2022-10-21T00:00:00.000Z',
            count: 1,
          },
          {
            date: '2022-10-22T00:00:00.000Z',
            count: 0,
          },
        ]);
      });

      it('returns an error when the startDate and endDate values are too far apart', async () => {
        const date23DaysAgo = DateTime.now().minus({ days: 23 }).toJSDate();
        const date23DaysInFuture = DateTime.now().plus({ days: 23 }).toJSDate();
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/by-date-range/counts?startDate=${date23DaysAgo.toISOString()}&endDate=${date23DaysInFuture.toISOString()}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe(
          'Dates are too far apart.  Cannot return results.  Please try again with dates that are closer together.',
        );
      });
    });

    describe('Validation', () => {
      it('startDate should not be empty', async () => {
        const limit = 10;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events?endDate=${endDateForSearch}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('startDate should not be empty');
      });

      it('endDate should not be empty', async () => {
        const limit = 10;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events?startDate=${startDateForSearch}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('endDate should not be empty');
      });
    });
  });
});
