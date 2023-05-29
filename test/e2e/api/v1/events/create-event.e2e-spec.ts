/* eslint-disable max-lines */
import * as request from 'supertest';
import * as path from 'path';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { readdirSync } from 'fs';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { EventCategoriesService } from '../../../../../src/event-categories/providers/event-categories.service';
import { eventCategoryFactory } from '../../../../factories/event-category.factory';
import { EventCategory } from '../../../../../src/schemas/eventCategory/eventCategory.schema';
import { createTempFiles } from '../../../../helpers/tempfile-helpers';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Events create / (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let eventCategoriesService: EventCategoriesService;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let activeEventCategory: EventCategory;
  let configService: ConfigService;

  const sampleEventCreateObject = {
    name: 'Event name test',
    startDate: '2022-09-05',
    endDate: '2022-09-10',
    country: 'United States',
    state: 'CA',
    city: 'San Francisco',
    event_info: 'test event start',
    url: 'www.example.com',
    author: 'Test',
    address: '66 Ceres S',
  };

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

    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(userFactory.build());
    activeEventCategory = await eventCategoriesService.create(eventCategoryFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('POST /api/v1/events', () => {
    let postBody: any;
    beforeEach(() => {
      postBody = { ...sampleEventCreateObject };
      postBody.userId = activeUser._id.toString();
      postBody.event_type = activeEventCategory._id.toString();
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer()).post('/api/v1/events').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Successful create', () => {
      it('create the event data successful', async () => {
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.CREATED);
          const expectedImageValues = tempPath.map(() => expect.stringMatching(/\/event\/event_.+\.png|jpe?g|gif/));

          expect(response.body).toEqual({
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            name: 'Event name test',
            userId: activeUser._id.toString(),
            images: expectedImageValues,
            startDate: `${postBody.startDate}T00:00:00.000Z`,
            endDate: `${postBody.endDate}T00:00:00.000Z`,
            event_type: activeEventCategory._id.toString(),
            city: 'San Francisco',
            state: 'CA',
            address: '66 Ceres S',
            country: 'United States',
            url: 'www.example.com',
            event_info: 'test event start',
          });
        }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpeg' }, { extension: 'gif' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('is successful when the user submits a request that contains none of the optional fields', async () => {
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.CREATED);
          const expectedImageValues = tempPath.map(() => expect.stringMatching(/\/event\/event_.+\.png|jpe?g|gif/));

          expect(response.body).toEqual({
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            name: 'Event name test',
            userId: activeUser._id.toString(),
            images: expectedImageValues,
            startDate: `${postBody.startDate}T00:00:00.000Z`,
            endDate: `${postBody.endDate}T00:00:00.000Z`,
            event_type: activeEventCategory._id.toString(),
            city: null,
            state: 'CA',
            address: null,
            country: 'United States',
            url: 'www.example.com',
            event_info: null,
          });
        }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpeg' }, { extension: 'gif' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });
    });

    describe('Validation', () => {
      it('name should not be empty', async () => {
        postBody.name = '';
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('name should not be empty');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('name must be shorter than or equal to 150 characters', async () => {
        postBody.name = new Array(155).join('b');
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('name must be shorter than or equal to 150 characters');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('event_type should not be empty', async () => {
        postBody.event_type = '';
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('event_type should not be empty');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('event_type must be a mongodb id', async () => {
        postBody.event_type = 'adsafasag';
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('Invalid event_type');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('startDate should not be empty', async () => {
        postBody.startDate = '';
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('startDate should not be empty');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('endDate should not be empty', async () => {
        postBody.endDate = '';
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('endDate should not be empty');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);
      });

      it('country should not be empty', async () => {
        postBody.country = '';
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('country should not be empty');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('country must be shorter than or equal to 100 characters', async () => {
        postBody.country = new Array(102).join('c');
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('country must be shorter than or equal to 100 characters');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('state should not be empty', async () => {
        postBody.state = '';
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('state should not be empty');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('state must be shorter than or equal to 100 characters', async () => {
        postBody.state = new Array(102).join('c');
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('state must be shorter than or equal to 100 characters');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('city must be shorter than or equal to 100 characters', async () => {
        postBody.city = new Array(102).join('c');
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('city must be shorter than or equal to 100 characters');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('address must be shorter than or equal to 150 characters', async () => {
        postBody.address = new Array(155).join('b');
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('address must be shorter than or equal to 150 characters');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('event_info must be shorter than or equal to 1000 characters', async () => {
        postBody.event_info = new Array(1002).join('a');

        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('event_info must be shorter than or equal to 1000 characters');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('url must be shorter than or equal to 300 characters', async () => {
        postBody.url = new Array(302).join('a');

        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('url must be shorter than or equal to 300 characters');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('author must be shorter than or equal to 100 characters', async () => {
        postBody.author = new Array(102).join('a');

        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain('author must be shorter than or equal to 100 characters');
        }, [{ extension: 'png' }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('when one of the files is not jpg, jpeg, png, or gif then it will give expected response', async () => {
        await createTempFiles(async (tempPaths) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPaths[0])
            .attach('files', tempPaths[1])
            .attach('files', tempPaths[2])
            .attach('files', tempPaths[3])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body.message).toContain(`Unsupported file type: ${path.basename(tempPaths[1])}`);
        }, [{ extension: 'png' }, { extension: 'zip' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('if file size should not larger than 20MB then it will give expected response', async () => {
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .expect(HttpStatus.PAYLOAD_TOO_LARGE);

          expect(response.body.message).toContain('File too large');
        }, [{ extension: 'png', size: 1024 * 1024 * 21 }, { extension: 'png' }, { extension: 'png' }, { extension: 'png' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });

      it('if files more than 4 then it will give expected response', async () => {
        await createTempFiles(async (tempPath) => {
          const response = await request(app.getHttpServer())
            .post('/api/v1/events')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field('name', postBody.name)
            .field('userId', postBody.userId)
            .field('event_type', postBody.event_type)
            .field('startDate', postBody.startDate)
            .field('endDate', postBody.endDate)
            .field('country', postBody.country)
            .field('state', postBody.state)
            .field('city', postBody.city)
            .field('address', postBody.address)
            .field('event_info', postBody.event_info)
            .field('url', postBody.url)
            .field('author', postBody.author)
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .attach('files', tempPath[4])
            .attach('files', tempPath[5])
            .expect(HttpStatus.BAD_REQUEST);

          expect(response.body).toEqual({ statusCode: 400, message: 'Too many files uploaded. Maximum allowed: 4' });
        }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'png' }, { extension: 'jpeg' }, { extension: 'jpeg' }]);

        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });
    });
  });
});
