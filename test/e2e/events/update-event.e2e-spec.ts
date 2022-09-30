import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
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

describe('Events / :id (e2e)', () => {
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
  });

  describe('PATCH /events/:id', () => {
    describe('Successful update', () => {
      it('update the event data successful and it returns the expected response', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/events/${activeEvent._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(sampleEventUpdateObject);
        const eventDetails = await eventService.findById(response.body.id, false);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toMatchObject(sampleEventUpdateObject);
        expect(eventDetails).toMatchObject(sampleEventUpdateObject);
      });

      it('when the author field is not provided, updated to other fields are still successful '
        + 'and it returns the expected response', async () => {
          const { author, ...restPostBody } = sampleEventUpdateObject;
          const response = await request(app.getHttpServer())
            .patch(`/events/${activeEvent._id}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send(restPostBody);
          const eventDetails = await eventService.findById(response.body.id, false);
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
          .patch(`/events/${activeEvent._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(restPostBody);
        const eventDetails = await eventService.findById(response.body.id, false);
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body.author).toBeUndefined();
        expect(response.body.name).toBeUndefined();
        expect(response.body.url).toBeUndefined();

        expect(eventDetails.event_info).toEqual(sampleEventUpdateObject.event_info);
        expect(eventDetails.author).toEqual(activeEvent.author);
        expect(eventDetails.name).toEqual(activeEvent.name);
        expect(eventDetails.url).toEqual(activeEvent.url);
      });
    });

    describe('Validation', () => {
      it('event_info is maximum 1000 characters long', async () => {
        sampleEventUpdateObject.event_info = 'egcqoocgjwhilizmzdczrndxkqubpttyaosowxvssitzpfnmrzlffbzciwrnyyrcdeszhxdrdfdadsh'
        + 'egcqoocgjwhilizmzdczrndxkqubpttyaosowxvssitzpfnmrzlffbzciwrnyyrcdeszhxdrdfdadsh'
        + 'egcqoocgjwhilizmzdczrndxkqubpttyaosowxvssitzpfnmrzlffbzciwrnyyrcdeszhxdrdfdadsh'
        + 'egcqoocgjwhilizmzdczrndxkqubpttyaosowxvssitzpfnmrzlffbzciwrnyyrcdeszhxdrdfdadsh'
        + 'egcqoocgjwhilizmzdczrndxkqubpttyaosowxvssitzpfnmrzlffbzciwrnyyrcdeszhxdrdfdadsh'
        + 'egcqoocgjwhilizmzdczrndxkqubpttyaosowxvssitzpfnmrzlffbzciwrnyyrcdeszhxdrdfdadsh'
        + 'egcqoocgjwhilizmzdczrndxkqubpttyaosowxvssitzpfnmrzlffbzciwrnyyrcdeszhxdrdfdadsh'
        + 'egcqoocgjwhilizmzdczrndxkqubpttyaosowxvssitzpfnmrzlffbzciwrnyyrcdeszhxdrdfdadsh'
        + 'egcqoocgjwhilizmzdczrndxkqubpttyaosowxvssitzpfnmrzlffbzciwrnyyrcdeszhxdrdfdadsh'
        + 'egcqoocgjwhilizmzdczrndxkqubpttyaosowxvssitzpfnmrzlffbzciwrnyyrcdeszhxdrdfdadsh'
        + 'egcqoocgjwhilizmzdczrndxkqubpttyaosowxvssitzpfnmrzlffbzciwrnyyrcdeszhxdrdfdadsh'
        + 'egcqoocgjwhilizmzdczrndxkqubpttyaosowxvssitzpfnmrzlffbzciwrnyyrcdeszhxdrdfdadsh'
        + 'egcqoocgjwhilizmzdczrndxkqubpttyaosowxvssitzpfnmrzlffbzciwrnyyrcdeszhxdrdfdadsh';

        const response = await request(app.getHttpServer())
          .patch(`/events/${activeEvent._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(sampleEventUpdateObject);
        expect(response.body.message).toContain(
          'event_info must be shorter than or equal to 1000 characters',
        );
      });
    });
  });
});
