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
import { EventActiveStatus } from '../../../src/schemas/event/event.enums';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';

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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    activeUser = await usersService.create(userFactory.build());
    activeEventCategory = await eventCategoriesService.create(eventCategoryFactory.build());
    activeEvent = await eventService.create(eventsFactory.build({
      userId: activeUser._id,
      event_type: activeEventCategory,
      status: EventActiveStatus.Active,
    }));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('GET /events/:id', () => {
    describe('Successful get event data', () => {
      it('get the event data successful if parameter id value is exists', async () => {
        const response = await request(app.getHttpServer())
          .get(`/events/${activeEvent._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          images: [
            'http://localhost:4444/placeholders/default_user_icon.png',
            'http://localhost:4444/placeholders/default_user_icon.png',
          ],
          startDate: response.body.startDate,
          endDate: response.body.endDate,
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

      it('event not found if parameter id value does not exists', async () => {
        const tempEventObjectId = '6337f478980180f44e64487c';
        const response = await request(app.getHttpServer())
          .get(`/events/${tempEventObjectId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body.message).toContain('Event not found');
      });
    });
  });
});
