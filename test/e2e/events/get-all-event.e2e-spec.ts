import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { EventService } from '../../../src/events/providers/events.service';
import { EventCategoriesService } from '../../../src/event-categories/providers/event-categories.service';
import { eventCategoryFactory } from '../../factories/event-category.factory';
import { eventsFactory } from '../../factories/events.factory';
import { EventCategory } from '../../../src/schemas/eventCategory/eventCategory.schema';
import { Event } from '../../../src/schemas/event/event.schema';
import { EventActiveStatus } from '../../../src/schemas/event/event.enums';

describe('Events all / (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let eventService: EventService;
  let eventCategoriesService: EventCategoriesService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let activeEvent: Event;
  let activeEventCategory: EventCategory;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

    eventService = moduleRef.get<EventService>(EventService);
    eventCategoriesService = moduleRef.get<EventCategoriesService>(EventCategoriesService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();

    activeUser = await usersService.create(userFactory.build());
    activeEventCategory = await eventCategoriesService.create(eventCategoryFactory.build());
    activeEvent = await eventService.create(eventsFactory.build({
      userId: activeUser._id,
      event_type: activeEventCategory._id,
    }));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    for (let index = 0; index < 5; index += 1) {
      await eventService.create(
        eventsFactory.build(
          {
            userId: activeUser._id,
            event_type: activeEventCategory._id,
          },
        ),
      );
      await eventService.create(
        eventsFactory.build(
          {
            userId: activeUser._id,
            event_type: activeEventCategory._id,
            status: EventActiveStatus.Active,
          },
        ),
      );
    }
  });

  describe('GET /events', () => {
    describe('Successful get all events data', () => {
      it('get expected events data based on startDate and endDate within of that span', async () => {
        const limit = 10;
        const response = await request(app.getHttpServer())
          .get(`/events?startDate=${activeEvent.startDate}&endDate=${activeEvent.endDate}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toHaveLength(5);
      });

      it('get expected events data based on startDate and endDate that is not within of that span', async () => {
        const limit = 10;
        activeEvent.startDate = DateTime.now().minus({ days: 50 }).toJSDate();
        activeEvent.endDate = DateTime.now().minus({ days: 40 }).toJSDate();
        const response = await request(app.getHttpServer())
          .get(`/events?startDate=${activeEvent.startDate}&endDate=${activeEvent.endDate}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toHaveLength(0);
      });

      describe('when `after` argument is supplied', () => {
        it('get expected first and second sets of paginated results', async () => {
          const limit = 3;
          const firstResponse = await request(app.getHttpServer())
            .get(`/events?startDate=${activeEvent.startDate}&endDate=${activeEvent.endDate}&limit=${limit}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();
          expect(firstResponse.status).toEqual(HttpStatus.OK);
          expect(firstResponse.body).toHaveLength(3);

          const secondResponse = await request(app.getHttpServer())
            .get('/events?'
              + `startDate=${activeEvent.startDate}&endDate=${activeEvent.endDate}&limit=${limit}&after=${firstResponse.body[2]._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();
          expect(secondResponse.status).toEqual(HttpStatus.OK);
          expect(secondResponse.body).toHaveLength(2);

          // Last result in first set should have earlier sortStartDate value than first result of second set
          expect(firstResponse.body[limit - 1].sortStartDate.localeCompare(secondResponse.body[0].sortStartDate)).toBe(-1);
        });
      });
    });

    describe('Validation', () => {
      it('startDate should not be empty', async () => {
        const limit = 10;
        const response = await request(app.getHttpServer())
          .get(`/events?endDate=${activeEvent.endDate}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('startDate should not be empty');
      });

      it('endDate should not be empty', async () => {
        const limit = 10;
        const response = await request(app.getHttpServer())
          .get(`/events?startDate=${activeEvent.startDate}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('endDate should not be empty');
      });

      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/events?startDate=${activeEvent.startDate}&endDate=${activeEvent.endDate}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/events?startDate=${activeEvent.startDate}&endDate=${activeEvent.endDate}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 20', async () => {
        const limit = 21;
        const response = await request(app.getHttpServer())
          .get(`/events?startDate=${activeEvent.startDate}&endDate=${activeEvent.endDate}&limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 20');
      });
    });
  });
});
