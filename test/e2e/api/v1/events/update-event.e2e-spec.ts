import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection } from 'mongoose';
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
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { UserType } from '../../../../../src/schemas/user/user.enums';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Events update / :id (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let eventService: EventService;
  let eventCategoriesService: EventCategoriesService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let adminUserAuthToken: string;
  let activeUser: User;
  let activeEvent: Event;
  let activeEventCategory: EventCategory;
  let configService: ConfigService;
  let adminUser: User;

  const sampleEventUpdateObject = {
    name: 'Event 11',
    event_info: 'Test event info',
    url: 'https://example.test.com',
    author: 'Event Author',
  };

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

    adminUser = await usersService.create(userFactory.build({ userType: UserType.Admin }));
    adminUserAuthToken = adminUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    activeUser = await usersService.create(userFactory.build());
    activeEventCategory = await eventCategoriesService.create(eventCategoryFactory.build());
    activeEvent = await eventService.create(eventsFactory.build({
      userId: activeUser._id,
      event_type: activeEventCategory,
    }));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('PATCH /api/v1/events/:id', () => {
    it('requires authentication', async () => {
      const eventId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).patch(`/api/v1/events/${eventId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Non-admin users are not allowed to update event', () => {
      it('should fail to update the and returns the expected response', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/events/${activeEvent._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(sampleEventUpdateObject);
        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
        expect(response.body).toEqual({
          message: 'Unauthorized',
          statusCode: 401,
        });
      });
    });

    describe('Successful update', () => {
      it('update the event data successful and it returns the expected response', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/events/${activeEvent._id}`)
          .auth(adminUserAuthToken, { type: 'bearer' })
          .send(sampleEventUpdateObject);
        const eventDetails = await eventService.findById(response.body._id, false);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toMatchObject(sampleEventUpdateObject);
        expect(eventDetails).toMatchObject(sampleEventUpdateObject);
      });

      it('when the author field is not provided, updated to other fields are still successful '
        + 'and it returns the expected response', async () => {
          const { author, ...restPostBody } = sampleEventUpdateObject;
          const response = await request(app.getHttpServer())
            .patch(`/api/v1/events/${activeEvent._id}`)
            .auth(adminUserAuthToken, { type: 'bearer' })
            .send(restPostBody);
          const eventDetails = await eventService.findById(response.body._id, false);
          expect(response.status).toEqual(HttpStatus.OK);
          expect(response.body.author).toBeUndefined();
          expect(eventDetails).toMatchObject(restPostBody);
          expect(eventDetails.author).toEqual(activeEvent.author);
        });

      it('update the event_info successful, it returns the expected response', async () => {
        const {
          author, name, url, ...restPostBody
        } = sampleEventUpdateObject;
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/events/${activeEvent._id}`)
          .auth(adminUserAuthToken, { type: 'bearer' })
          .send(restPostBody);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          event_info: 'Test event info',
        });
      });
    });

    describe('Validation', () => {
      it('id must be a mongodb id', async () => {
        const eventId = 'not-a-mongo-id';
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/events/${eventId}`)
          .auth(adminUserAuthToken, { type: 'bearer' })
          .send(sampleEventUpdateObject);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'id must be a mongodb id',
        );
      });

      it('name must be shorter than or equal to 150 characters', async () => {
        sampleEventUpdateObject.name = new Array(155).join('b');
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/events/${activeEvent._id}`)
          .auth(adminUserAuthToken, { type: 'bearer' })
          .send(sampleEventUpdateObject)
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.message).toContain('name must be shorter than or equal to 150 characters');
      });

      it('event_info is maximum 1000 characters long', async () => {
        sampleEventUpdateObject.event_info = new Array(1002).join('a');

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/events/${activeEvent._id}`)
          .auth(adminUserAuthToken, { type: 'bearer' })
          .send(sampleEventUpdateObject);
        expect(response.body.message).toContain(
          'event_info must be shorter than or equal to 1000 characters',
        );
      });

      it('url must be shorter than or equal to 300 characters', async () => {
        sampleEventUpdateObject.url = new Array(302).join('a');

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/events/${activeEvent._id}`)
          .auth(adminUserAuthToken, { type: 'bearer' })
          .send(sampleEventUpdateObject)
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.message).toContain('url must be shorter than or equal to 300 characters');
      });

      it('event_type must be a valid mongodb id', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/events/${activeEvent._id}`)
          .auth(adminUserAuthToken, { type: 'bearer' })
          .send({ ...sampleEventUpdateObject, event_type: 'not-valid' })
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.message).toContain('Invalid event_type');
      });

      it('author must be shorter than or equal to 100 characters', async () => {
        sampleEventUpdateObject.author = new Array(102).join('a');

        const response = await request(app.getHttpServer())
          .patch(`/api/v1/events/${activeEvent._id}`)
          .auth(adminUserAuthToken, { type: 'bearer' })
          .send(sampleEventUpdateObject)
          .expect(HttpStatus.BAD_REQUEST);

        expect(response.body.message).toContain('author must be shorter than or equal to 100 characters');
      });
    });
  });
});
