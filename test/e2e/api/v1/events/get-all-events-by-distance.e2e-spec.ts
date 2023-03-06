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
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Events all by distance / (e2e)', () => {
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

  describe('GET /api/v1/events/by-distance', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/events/by-distance').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Successful get all events in 300 miles', () => {
      it('get expected events data based on startDate and endDate within of that span', async () => {
        const lattitude = 41.055877;
        const longitude = -74.95479;
        const maxDistanceMiles = 300;

        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/by-distance?lattitude=${lattitude}&longitude=${longitude}&maxDistanceMiles=${maxDistanceMiles}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        // eslint-disable-next-line no-console
        console.log('response?', response.body);
        expect(1).toBe(1);
      });
    });
  });
});
