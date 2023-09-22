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
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Events all by date range / (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let eventService: EventService;
  let eventCategoriesService: EventCategoriesService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let activeEventCategory: EventCategory;
  let configService: ConfigService;

  const activeEventData = [
    { start: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-19T23:59:59Z').toJSDate() },
    { start: DateTime.fromISO('2022-10-18T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-20T23:59:59Z').toJSDate() },
    { start: DateTime.fromISO('2022-10-19T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-21T23:59:59Z').toJSDate() },
    { start: DateTime.fromISO('2022-10-20T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-22T23:59:59Z').toJSDate() },
    { start: DateTime.fromISO('2022-10-21T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-23T23:59:59Z').toJSDate() },
  ];
  const inactiveEventData = [
    { start: DateTime.fromISO('2022-10-18T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-18T23:59:59Z').toJSDate() },
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

    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(userFactory.build());
    activeEventCategory = await eventCategoriesService.create(eventCategoryFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    for (const eventDateRange of activeEventData) {
      await eventService.create(
        eventsFactory.build(
          {
            userId: activeUser._id,
            event_type: activeEventCategory,
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
            event_type: activeEventCategory,
            startDate: eventDateRange.start,
            endDate: eventDateRange.end,
            status: EventActiveStatus.Inactive,
          },
        ),
      );
    }
  });

  describe('GET /api/v1/events/by-date-range', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/events/by-date-range').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Successful get all events data', () => {
      it('get expected events data based on startDate and endDate within of that span', async () => {
        const limit = 10;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/by-date-range?startDate=${startDateForSearch}&endDate=${endDateForSearch}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        for (let i = 1; i < response.body.length; i += 1) {
          expect(response.body[i - 1].startDate < response.body[i].startDate).toBe(true);
        }
        for (let i = 1; i < response.body.length; i += 1) {
          expect(response.body[i]).toEqual({
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            images: [
              'http://localhost:4444/placeholders/default_user_icon.png',
              'http://localhost:4444/placeholders/default_user_icon.png',
            ],
            name: expect.any(String),
            startDate: activeEventData[i].start.toISOString(),
            endDate: activeEventData[i].end.toISOString(),
            event_type: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            city: 'Los Angeles',
            state: 'California',
            address: null,
            country: 'USA',
          });
        }
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toHaveLength(5);
      });

      it('get expected events data based on startDate and endDate that is not within of that span', async () => {
        const limit = 10;
        const startDate = DateTime.now().minus({ days: 50 }).toJSDate();
        const endDate = DateTime.now().minus({ days: 40 }).toJSDate();
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/by-date-range?startDate=${startDate}&endDate=${endDate}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toHaveLength(0);
      });

      it('returns the expected response (with placeholder image) when the event has no images', async () => {
        const activeEventDetails = [
          { start: DateTime.fromISO('2022-10-24T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-25T23:59:59Z').toJSDate() },
          { start: DateTime.fromISO('2022-10-25T00:00:00Z').toJSDate(), end: DateTime.fromISO('2022-10-26T23:59:59Z').toJSDate() },
        ];
        const startDate = DateTime.fromISO('2022-10-24', { setZone: true }).toJSDate();
        const endDate = DateTime.fromISO('2022-10-26', { setZone: true }).toJSDate();
        for (const eventDateRange of activeEventDetails) {
          await eventService.create(
            eventsFactory.build(
              {
                userId: activeUser._id,
                event_type: activeEventCategory,
                startDate: eventDateRange.start,
                endDate: eventDateRange.end,
                status: EventActiveStatus.Active,
                images: [],
              },
            ),
          );
        }
        const limit = 10;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/by-date-range?startDate=${startDate}&endDate=${endDate}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            images: ['http://localhost:4444/placeholders/no_image_available.png'],
            name: 'Event name 7',
            startDate: '2022-10-24T00:00:00.000Z',
            endDate: '2022-10-25T23:59:59.000Z',
            event_type: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            city: 'Los Angeles',
            state: 'California',
            address: null,
            country: 'USA',
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            images: ['http://localhost:4444/placeholders/no_image_available.png'],
            name: 'Event name 8',
            startDate: '2022-10-25T00:00:00.000Z',
            endDate: '2022-10-26T23:59:59.000Z',
            event_type: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            city: 'Los Angeles',
            state: 'California',
            address: null,
            country: 'USA',
          },
        ]);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toHaveLength(2);
      });

      describe('when `after` argument is supplied', () => {
        it('get expected first and second sets of paginated results', async () => {
          const limit = 3;
          const firstResponse = await request(app.getHttpServer())
            .get(`/api/v1/events/by-date-range?startDate=${startDateForSearch}&endDate=${endDateForSearch}&limit=${limit}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();
          for (let i = 1; i < firstResponse.body.length; i += 1) {
            expect(firstResponse.body[i - 1].startDate < firstResponse.body[i].startDate).toBe(true);
          }
          expect(firstResponse.status).toEqual(HttpStatus.OK);
          expect(firstResponse.body).toHaveLength(3);

          const secondResponse = await request(app.getHttpServer())
            .get('/api/v1/events/by-date-range?'
              + `startDate=${startDateForSearch}&endDate=${endDateForSearch}&limit=${limit}&after=${firstResponse.body[2]._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();
          for (let i = 1; i < secondResponse.body.length; i += 1) {
            expect(secondResponse.body[i - 1].startDate < secondResponse.body[i].startDate).toBe(true);
          }
          expect(secondResponse.status).toEqual(HttpStatus.OK);
          expect(secondResponse.body).toHaveLength(2);

          // Last result in first set should have earlier sortStartDate value than first result of second set
          expect(firstResponse.body[limit - 1].startDate.localeCompare(secondResponse.body[0].startDate)).toBe(-1);
        });
      });
    });

    describe('Validation', () => {
      it('startDate should not be empty', async () => {
        const limit = 10;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/by-date-range?endDate=${endDateForSearch}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('startDate should not be empty');
      });

      it('endDate should not be empty', async () => {
        const limit = 10;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/by-date-range?startDate=${startDateForSearch}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('endDate should not be empty');
      });

      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/by-date-range?startDate=${startDateForSearch}&endDate=${endDateForSearch}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/by-date-range?startDate=${startDateForSearch}&endDate=${endDateForSearch}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 20', async () => {
        const limit = 21;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/by-date-range?startDate=${startDateForSearch}&endDate=${endDateForSearch}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 20');
      });
    });
  });
});
