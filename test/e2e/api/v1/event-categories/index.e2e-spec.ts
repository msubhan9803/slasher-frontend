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
import { EventCategoriesService } from '../../../../../src/event-categories/providers/event-categories.service';
import { eventCategoryFactory } from '../../../../factories/event-category.factory';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';

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
    connection = moduleRef.get<Connection>(getConnectionToken());
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

    activeUser = await usersService.create(
      userFactory.build(),
    );
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('GET /api/v1/event-categories', () => {
    it('returns the expected response', async () => {
      const eventCategory1 = await eventCategoriesService.create(eventCategoryFactory.build());
      const eventCategory2 = await eventCategoriesService.create(eventCategoryFactory.build());
      const response = await request(app.getHttpServer())
        .get('/api/v1/event-categories')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .expect(HttpStatus.OK);
      expect(response.body)
        .toEqual([
          {
            _id: eventCategory1._id.toString(),
            event_name: 'Event category 1',
          },
          {
            _id: eventCategory2._id.toString(),
            event_name: 'Event category 2',
          },
        ]);
    });
  });
});
