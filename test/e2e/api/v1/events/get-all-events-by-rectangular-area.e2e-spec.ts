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

describe('Events all by rectangular area / (e2e)', () => {
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
          coordinates: [41.045877, -74.94479],
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
          coordinates: [41.048899, -74.947958],
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
          coordinates: [41.045877, -74.99479],
        },
      }),
    );
  });

  describe('GET /api/v1/events/by-rectangular-area', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/events/by-rectangular-area').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Successfully get all events', () => {
      it('Get events in given rectangular area', async () => {
        const latitudeTopRight = 41.08840841260634;
        const longitudeTopRight = -74.89843368530275;
        const latitudeBottomLeft = 41.01332484409777;
        const longitudeBottomLeft = -75.03129959106447;

        const response = await request(app.getHttpServer())
          // eslint-disable-next-line max-len
          .get(`/api/v1/events/by-rectangular-area?latitudeTopRight=${latitudeTopRight}&longitudeTopRight=${longitudeTopRight}&latitudeBottomLeft=${latitudeBottomLeft}&longitudeBottomLeft=${longitudeBottomLeft}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            address: null,
            city: 'Los Angeles',
            country: 'USA',
            startDate: expect.any(String),
            endDate: expect.any(String),
            event_type: activeEventCategory._id.toString(),
            images: [
              'http://localhost:4444/placeholders/default_user_icon.png',
              'http://localhost:4444/placeholders/default_user_icon.png',
            ],
            location: {
              coordinates: [
                41.045877,
                -74.94479,
              ],
              type: 'Point',
            },
            name: 'Event name 1',
            state: 'California',
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            address: null,
            city: 'Los Angeles',
            country: 'USA',
            startDate: expect.any(String),
            endDate: expect.any(String),
            event_type: activeEventCategory._id.toString(),
            images: [
              'http://localhost:4444/placeholders/default_user_icon.png',
              'http://localhost:4444/placeholders/default_user_icon.png',
            ],
            location: {
              coordinates: [
                41.048899,
                -74.947958,
              ],
              type: 'Point',
            },
            name: 'Event name 2',
            state: 'California',
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            address: null,
            city: 'Los Angeles',
            country: 'USA',
            startDate: expect.any(String),
            endDate: expect.any(String),
            event_type: activeEventCategory._id.toString(),
            images: [
              'http://localhost:4444/placeholders/default_user_icon.png',
              'http://localhost:4444/placeholders/default_user_icon.png',
            ],
            location: {
              coordinates: [
                41.045877,
                -74.99479,
              ],
              type: 'Point',
            },
            name: 'Event name 3',
            state: 'California',
          },
        ]);
      });

      describe('validations', () => {
        // eslint-disable-next-line max-len
        it('latitudeTopRight, longitudeTopRight, latitudeBottomLeft, longitudeBottomLeft should be number type and not be empty', async () => {
          const response = await request(app.getHttpServer())
            .get('/api/v1/events/by-rectangular-area')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();

          expect(response.body.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(response.body).toEqual({
            error: 'Bad Request',
            message: [
              'latitudeTopRight must be a number conforming to the specified constraints',
              'latitudeTopRight should not be empty',
              'longitudeTopRight must be a number conforming to the specified constraints',
              'longitudeTopRight should not be empty',
              'latitudeBottomLeft must be a number conforming to the specified constraints',
              'latitudeBottomLeft should not be empty',
              'longitudeBottomLeft must be a number conforming to the specified constraints',
              'longitudeBottomLeft should not be empty',
            ],
            statusCode: 400,
          });
        });
      });
    });
  });
});
