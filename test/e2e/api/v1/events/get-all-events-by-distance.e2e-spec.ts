import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
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
import { EventActiveStatus } from '../../../../../src/schemas/event/event.enums';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';

describe('Events all by distance / (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let eventService: EventService;
  let eventCategoriesService: EventCategoriesService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
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
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    await eventService.create(
      eventsFactory.build({
        userId: activeUser._id,
        event_type: activeEventCategory,
        status: EventActiveStatus.Active,
        location: {
          type: 'Point',
          coordinates: [41.055877, -79],
        },
      }),
    );
    await eventService.create(
      eventsFactory.build({
        userId: activeUser._id,
        event_type: activeEventCategory,
        status: EventActiveStatus.Active,
        location: {
          type: 'Point',
          coordinates: [41.055877, -80],
        },
      }),
    );
    await eventService.create(
      eventsFactory.build({
        userId: activeUser._id,
        event_type: activeEventCategory,
        status: EventActiveStatus.Active,
        location: {
          type: 'Point',
          coordinates: [41.055877, -81],
        },
      }),
    );
  });

  describe('GET /api/v1/events/by-distance', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/events/by-distance').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Successful get all events in 300 miles', () => {
      it('Get events in 300 miles', async () => {
        const latitude = 41.055877;
        const longitude = -74.95479;
        const maxDistanceMiles = 300;

        const response = await request(app.getHttpServer())
          .get(`/api/v1/events/by-distance?latitude=${latitude}&longitude=${longitude}&maxDistanceMiles=${maxDistanceMiles}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            images: [
              'http://localhost:4444/placeholders/default_user_icon.png',
              'http://localhost:4444/placeholders/default_user_icon.png',
            ],
            name: 'Event name 1',
            startDate: expect.any(String),
            endDate: expect.any(String),
            event_type: activeEventCategory._id.toString(),
            city: 'Los Angeles',
            state: 'California',
            address: null,
            country: 'USA',
            location: { type: 'Point', coordinates: [41.055877, -79] },
            distance: 279.80839755496675,
          },
        ]);
      });

      describe('validations', () => {
        it('latitude, longitude and maxDistanceMiles should not be empty', async () => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/events/by-distance')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();

          expect(response.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(response.body).toEqual({
            error: 'Bad Request',
            message: [
              'latitude must be a number conforming to the specified constraints',
              'latitude should not be empty',
              'longitude must be a number conforming to the specified constraints',
              'longitude should not be empty',
              'maxDistanceMiles must be a number conforming to the specified constraints',
              'maxDistanceMiles should not be empty',
            ],
            statusCode: 400,
          });
        });

        it('latitude should be number type', async () => {
          const latitude = 'abc';
          const longitude = -74.95479;
          const maxDistanceMiles = 300;

          const response = await request(app.getHttpServer())
            .get(`/api/v1/events/by-distance?latitude=${latitude}&longitude=${longitude}&maxDistanceMiles=${maxDistanceMiles}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();

          expect(response.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(response.body).toEqual({
            error: 'Bad Request',
            message: [
              'latitude must be a number conforming to the specified constraints',
            ],
            statusCode: 400,
          });
        });

        it('longitude should be number type', async () => {
          const latitude = 41.055877;
          const longitude = 'abc';
          const maxDistanceMiles = 300;

          const response = await request(app.getHttpServer())
            .get(`/api/v1/events/by-distance?latitude=${latitude}&longitude=${longitude}&maxDistanceMiles=${maxDistanceMiles}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();

          expect(response.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(response.body).toEqual({
            error: 'Bad Request',
            message: [
              'longitude must be a number conforming to the specified constraints',
            ],
            statusCode: 400,
          });
        });

        it('maxDistanceMiles should be number type', async () => {
          const latitude = 41.055877;
          const longitude = -74.95479;
          const maxDistanceMiles = 'abc';

          const response = await request(app.getHttpServer())
            .get(`/api/v1/events/by-distance?latitude=${latitude}&longitude=${longitude}&maxDistanceMiles=${maxDistanceMiles}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();

          expect(response.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(response.body).toEqual({
            error: 'Bad Request',
            message: [
              'maxDistanceMiles must be a number conforming to the specified constraints',
            ],
            statusCode: 400,
          });
        });
      });
    });
  });
});
