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
import { EventCategoriesService } from '../../../src/event-categories/providers/event-categories.service';
import { eventCategoryFactory } from '../../factories/event-category.factory';
import { EventCategoryDocument } from '../../../src/schemas/eventCategory/eventCategory.schema';

describe('Event categories index (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let eventCategoriesService: EventCategoriesService;
  let usersService: UsersService;
  let configService: ConfigService;
  let activeUser: User;
  let activeUserAuthToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

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

    activeUser = await usersService.create(
      userFactory.build(),
    );
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('GET /event-categories', () => {
    let eventCategoryList: EventCategoryDocument[];
    beforeEach(async () => {
      eventCategoryList = [
        await eventCategoriesService.create(
          eventCategoryFactory.build(),
        ),
        await eventCategoriesService.create(
          eventCategoryFactory.build(),
        ),
      ];
    });

    it('returns the expected response', async () => {
      const expectedResponse = eventCategoryList
        .map((eventCategory) => ({
          _id: eventCategory._id.toString(),
          event_name: eventCategory.event_name,
          status: eventCategory.status,
          is_deleted: eventCategory.is_deleted,
          createdAt: eventCategory.createdAt.toISOString(),
          updatedAt: eventCategory.updatedAt.toISOString(),
        }));
      const response = await request(app.getHttpServer())
        .get('/event-categories')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .expect(HttpStatus.OK)
        .expect(expectedResponse);

      expect(response.body.map((eventCategory) => eventCategory.event_name))
      .toEqual(expectedResponse.map((expectedEventCategory) => expectedEventCategory.event_name));
    });
  });
});
