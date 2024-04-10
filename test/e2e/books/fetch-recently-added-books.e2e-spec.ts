/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { DateTime } from 'luxon';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../helpers/factory-helpers.ts';
import { BooksService } from '../../../src/books/providers/books.service';
import { BookActiveStatus } from '../../../src/schemas/book/book.enums';
import { booksFactory } from '../../factories/books.factory';

describe('Recently Added Books (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let booksService: BooksService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    booksService = moduleRef.get<BooksService>(BooksService);
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
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('GET /api/v1/books/recently/added', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/books/recently/added').expect(HttpStatus.UNAUTHORIZED);
    });

    it('when sortBy is name than expected all books response', async () => {
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'a',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'b',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'c',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'd',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'e',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'name'}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      for (let i = 1; i < response.body.length; i += 1) {
        expect(response.body[i - 1].name < response.body[i].name).toBe(true);
      }
      expect(response.body).toHaveLength(5);
      expect(response.body).toEqual([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'a',
          coverImage: null,
          rating: 0,
          worthReading: 0,
          publishDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'b',
          coverImage: null,
          rating: 0,
          worthReading: 0,
          publishDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'c',
          coverImage: null,
          rating: 0,
          worthReading: 0,
          publishDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'd',
          coverImage: null,
          rating: 0,
          worthReading: 0,
          publishDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'e',
          coverImage: null,
          rating: 0,
          worthReading: 0,
          publishDate: '2022-10-17T00:00:00.000Z',
        },
      ]);
    });

    it('when sortBy is publishDate than expected all books response', async () => {
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'a',
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'c',
          publishDate: DateTime.fromISO('2022-10-18T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'b',
          publishDate: DateTime.fromISO('2022-10-19T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'e',
          publishDate: DateTime.fromISO('2022-10-20T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'd',
          publishDate: DateTime.fromISO('2022-10-21T00:00:00Z').toJSDate(),
        }),
      );
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'publishDate'}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      for (let i = 0; i < response.body.length - 1; i += 1) {
        expect(response.body[i].publishDate > response.body[i + 1].publishDate).toBe(true);
      }
      expect(response.body).toMatchObject([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'd',
          publishDate: '2022-10-21T00:00:00.000Z',
          rating: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'e',
          publishDate: '2022-10-20T00:00:00.000Z',
          rating: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'b',
          publishDate: '2022-10-19T00:00:00.000Z',
          rating: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'c',
          publishDate: '2022-10-18T00:00:00.000Z',
          rating: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'a',
          publishDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
        },
      ]);
      expect(response.body).toHaveLength(5);
    });

    it('when sortBy is rating than expected all books response', async () => {
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'a',
          rating: 1,
          worthReading: 2,
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'b',
          rating: 2,
          worthReading: 1,
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'c',
          rating: 3,
          worthReading: 0,
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'd',
          rating: 4,
          worthReading: 1,
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'e',
          rating: 5,
          worthReading: 2,
          publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
        }),
      );
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'rating'}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      for (let i = 1; i < response.body.length; i += 1) {
        expect(response.body[i].rating < response.body[i - 1].rating).toBe(true);
      }
      expect(response.body).toHaveLength(5);
      expect(response.body).toEqual([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'e',
          coverImage: null,
          rating: 5,
          worthReading: 2,
          publishDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'd',
          coverImage: null,
          rating: 4,
          worthReading: 1,
          publishDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'c',
          coverImage: null,
          rating: 3,
          worthReading: 0,
          publishDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'b',
          coverImage: null,
          rating: 2,
          worthReading: 1,
          publishDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'a',
          coverImage: null,
          rating: 1,
          worthReading: 2,
          publishDate: '2022-10-17T00:00:00.000Z',
        },
      ]);
    });

    it('when name contains supplied than expected all books response', async () => {
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'already dead',
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'harvest home',
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'carrie',
        }),
      );
      const limit = 5;
      const nameContains = 'rea';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'rating'}&nameContains=${nameContains}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(1);
    });

    it('when the startsWith is exist than expected response', async () => {
      const book = await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'GrEaT Book #9',
        }),
      );
      const sortNameStartsWith = 'great';
      const limit = 3;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'name'}&startsWith=${sortNameStartsWith}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([{
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        name: book.name,
        coverImage: null,
        publishDate: book.publishDate.toISOString(),
        rating: 0,
        worthReading: 0,
      }]);
    });

    it('when startsWith is not exist and nameContains is exist than expected response', async () => {
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'alive',
        }),
      );
      const nameContains = 'li';
      const sortNameStartsWith = 'b';
      const limit = 3;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'name'}&nameContains=${nameContains}&startsWith=${sortNameStartsWith}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(0);
    });

    it('when startsWith is exist and nameContains is not exist than expected response', async () => {
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'alive',
        }),
      );
      const nameContains = 'rr';
      const sortNameStartsWith = 'a';
      const limit = 3;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/books?limit=${limit}&sortBy=${'name'}&nameContains=${nameContains}&startsWith=${sortNameStartsWith}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([]);
    });

    it('when startsWith and nameContains is exists than expected response', async () => {
      const book0 = await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'alive',
        }),
      );
      const book1 = await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'The alive',
        }),
      );
      const nameContains = 'li';
      const sortNameStartsWith = 'a';
      const limit = 3;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'name'}&nameContains=${nameContains}&startsWith=${sortNameStartsWith}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([{
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        name: book0.name,
        coverImage: null,
        publishDate: book0.publishDate.toISOString(),
        rating: 0,
        worthReading: 0,
      },
      {
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        name: book1.name,
        coverImage: null,
        publishDate: book1.publishDate.toISOString(),
        rating: 0,
        worthReading: 0,
      }]);
    });

    it('returns the data which are added in last 30 days', async () => {
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'horror 1',
          createdAt: DateTime.now().minus({ days: 15 }).toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'horror 2',
          createdAt: DateTime.now().minus({ days: 32 }).toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'horror 3',
          createdAt: DateTime.now().minus({ days: 35 }).toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'horror 4',
          createdAt: DateTime.now().minus({ days: 20 }).toJSDate(),
        }),
      );
      await booksService.create(
        booksFactory.build({
          status: BookActiveStatus.Active,
          name: 'horror 5',
          createdAt: DateTime.now().minus({ days: 25 }).toJSDate(),
        }),
      );
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/books/recently/added?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toMatchObject([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'horror 5',
          coverImage: null,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'horror 4',
          coverImage: null,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'horror 1',
          coverImage: null,
        },
      ]);
      expect(response.body).toHaveLength(3);
    });

    describe('when `after` argument is supplied', () => {
      beforeEach(async () => {
        const rating = [1, 2, 3, 4, 5];
        for (let i = 0; i < 5; i += 1) {
          await booksService.create(
            booksFactory.build(
              {
                status: BookActiveStatus.Active,
                rating: rating[i],
              },
            ),
          );
        }
      });
      it('sort by name returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResponse = await request(app.getHttpServer())
          .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.status).toEqual(HttpStatus.OK);
        expect(firstResponse.body).toHaveLength(3);

        const secondResponse = await request(app.getHttpServer())
          .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'name'}&after=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.status).toEqual(HttpStatus.OK);
        expect(secondResponse.body).toHaveLength(2);
      });

      it('sort by publishDate returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResponse = await request(app.getHttpServer())
          .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'publishDate'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.status).toEqual(HttpStatus.OK);
        expect(firstResponse.body).toHaveLength(3);

        const secondResponse = await request(app.getHttpServer())
          .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'publishDate'}&after=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.status).toEqual(HttpStatus.OK);
        expect(secondResponse.body).toHaveLength(2);
      });

      it('sort by rating returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const rating = 'rating';
        const firstResponse = await request(app.getHttpServer())
          .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${rating}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.status).toEqual(HttpStatus.OK);
        expect(firstResponse.body).toHaveLength(3);

        const secondResponse = await request(app.getHttpServer())
          .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${rating}&after=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.status).toEqual(HttpStatus.OK);
        expect(secondResponse.body).toHaveLength(2);
      });
    });

    it('when sort_name startsWith with # than expected all books response', async () => {
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: '#1915House',
            publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: '!Alive',
            publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: 'Blue$Whale',
            publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: '(Captured)',
            publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: '.Chadgetstheaxe',
            publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: '>EATPRETTY',
            publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: '???Float',
            publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: '@FollowMe',
            publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: '[funnyFACE',
            publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: '`Horror',
            publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: '~iKllr',
            publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await booksService.create(
        booksFactory.build(
          {
            status: BookActiveStatus.Active,
            name: 'MurderSelfie',
            publishDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      const sortNameStartsWith = '%23';
      const limit = 20;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'name'}&startsWith=${sortNameStartsWith}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(10);
      expect(response.body).toEqual([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '#1915House',
          coverImage: null,
          publishDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthReading: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '!Alive',
          coverImage: null,
          publishDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthReading: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '(Captured)',
          coverImage: null,
          publishDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthReading: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '.Chadgetstheaxe',
          coverImage: null,
          publishDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthReading: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '>EATPRETTY',
          coverImage: null,
          publishDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthReading: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '???Float',
          coverImage: null,
          publishDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthReading: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '@FollowMe',
          coverImage: null,
          publishDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthReading: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '[funnyFACE',
          coverImage: null,
          publishDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthReading: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '`Horror',
          coverImage: null,
          publishDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthReading: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '~iKllr',
          coverImage: null,
          publishDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthReading: 0,
        },
      ]);
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/books/recently/added?&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('returns an error if the limit is higher than allowed', async () => {
        const limit = 61;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'publishDate'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 60');
      });

      it('sortBy must be one of the following values: name, publishDate, rating', async () => {
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'tests'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('sortBy must be one of the following values: name, publishDate, rating');
      });

      it('responds with error message when an invalid startsWith supplied', async () => {
        const startsWith = '@qw$re';
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/books/recently/added?limit=${limit}&sortBy=${'name'}&startsWith=${startsWith}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          statusCode: 400,
          message: ['startsWith must match /^[a-z0-9#]+$/ regular expression'],
          error: 'Bad Request',
        });
      });
    });
  });
});
