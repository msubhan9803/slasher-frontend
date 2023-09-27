import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection } from 'mongoose';
import { DateTime } from 'luxon';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { EventService } from '../../../../../src/events/providers/events.service';
import { EventCategoriesService } from '../../../../../src/event-categories/providers/event-categories.service';
import { eventCategoryFactory } from '../../../../factories/event-category.factory';
import { eventsFactory } from '../../../../factories/events.factory';
import { EventCategory } from '../../../../../src/schemas/eventCategory/eventCategory.schema';
import { Event } from '../../../../../src/schemas/event/event.schema';
import { EventActiveStatus } from '../../../../../src/schemas/event/event.enums';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Events / :id (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let eventService: EventService;
  let eventCategoriesService: EventCategoriesService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let activeEvent: Event;
  let activeEvent1: Event;
  let activeEventCategory: EventCategory;
  let configService: ConfigService;

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
    activeEvent = await eventService.create(eventsFactory.build({
      userId: activeUser._id,
      event_type: activeEventCategory,
      status: EventActiveStatus.Active,
      startDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
      endDate: DateTime.fromISO('2022-10-19T00:00:00Z').toJSDate(),
    }));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('GET /api/v1/events/:id', () => {
    it('requires authentication', async () => {
      const eventId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).get(`/api/v1/events/${eventId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Successful get event data', () => {
      it('get the event data successful if parameter id value is exists', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/${activeEvent._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          images: [
            'http://localhost:4444/placeholders/default_user_icon.png',
            'http://localhost:4444/placeholders/default_user_icon.png',
          ],
          name: 'Event name 1',
          startDate: '2022-10-17T00:00:00.000Z',
          endDate: '2022-10-19T00:00:00.000Z',
          event_type: {
            _id: activeEventCategory._id.toString(),
            event_name: 'Event category 1',
          },
          city: 'Los Angeles',
          state: 'California',
          address: null,
          country: 'USA',
          url: 'https://example.com',
          event_info: 'Event info organised by 1',
        });
      });

      it('returns the expected response (with placeholder image) when the event has no images', async () => {
        activeEvent1 = await eventService.create(eventsFactory.build({
          userId: activeUser._id,
          event_type: activeEventCategory,
          status: EventActiveStatus.Active,
          images: [],
          startDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          endDate: DateTime.fromISO('2022-10-19T00:00:00Z').toJSDate(),
        }));
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/${activeEvent1._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          images: [
            'http://localhost:4444/placeholders/no_image_available.png',
          ],
          name: 'Event name 2',
          startDate: '2022-10-17T00:00:00.000Z',
          endDate: '2022-10-19T00:00:00.000Z',
          event_type: {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            event_name: 'Event category 1',
          },
          city: 'Los Angeles',
          state: 'California',
          address: null,
          country: 'USA',
          url: 'https://example.com',
          event_info: 'Event info organised by 2',
        });
      });

      it('event not found if parameter id value does not exists', async () => {
        const tempEventObjectId = '6337f478980180f44e64487c';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/${tempEventObjectId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.message).toContain('Event not found');
      });
    });

    describe('Validation', () => {
      it('id must be a mongodb id', async () => {
        const eventId = 'not-a-mongo-id';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/${eventId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'id must be a mongodb id',
        );
      });
    });
  });
});
