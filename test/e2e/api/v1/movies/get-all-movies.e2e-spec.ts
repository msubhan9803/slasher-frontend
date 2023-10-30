/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { MoviesService } from '../../../../../src/movies/providers/movies.service';
import { moviesFactory } from '../../../../factories/movies.factory';
import { MovieActiveStatus } from '../../../../../src/schemas/movie/movie.enums';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('All Movies (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let moviesService: MoviesService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
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

  describe('GET /api/v1/movies?limit=&sortBy=', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/movies').expect(HttpStatus.UNAUTHORIZED);
    });

    it('transforms the logo field into a full Movie DB URL', async () => {
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active, name: 'a', logo: '/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .get('/api/v1/movies?limit=1&sortBy=name')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body[0].logo).toBe('https://image.tmdb.org/t/p/w220_and_h330_face/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg');
    });

    it('when logo is null than expected response', async () => {
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active, name: 'a', logo: null,
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .get('/api/v1/movies?limit=1&sortBy=name')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body[0].logo).toBe('http://localhost:4444/placeholders/movie_poster.png');
    });

    it('when sortBy is name than expected all movies response', async () => {
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'a',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'b',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'c',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'd',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'e',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/movies?limit=${limit}&sortBy=${'name'}`)
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
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 0,
          worthWatching: 0,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'b',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 0,
          worthWatching: 0,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'c',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 0,
          worthWatching: 0,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'd',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 0,
          worthWatching: 0,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'e',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 0,
          worthWatching: 0,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
      ]);
    });

    it('when sortBy is releaseDate than expected all movies response', async () => {
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
            name: 'a',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            releaseDate: DateTime.fromISO('2022-10-18T00:00:00Z').toJSDate(),
            name: 'c',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            releaseDate: DateTime.fromISO('2022-10-19T00:00:00Z').toJSDate(),
            name: 'b',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            releaseDate: DateTime.fromISO('2022-10-20T00:00:00Z').toJSDate(),
            name: 'e',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            releaseDate: DateTime.fromISO('2022-10-21T00:00:00Z').toJSDate(),
            name: 'd',
          },

        ),
      );
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/movies?limit=${limit}&sortBy=${'releaseDate'}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      for (let i = 0; i < response.body.length - 1; i += 1) {
        expect(response.body[i].releaseDate > response.body[i + 1].releaseDate).toBe(true);
      }
      expect(response.body).toMatchObject([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'd',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-21T00:00:00.000Z',
          rating: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'e',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-20T00:00:00.000Z',
          rating: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'b',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-19T00:00:00.000Z',
          rating: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'c',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-18T00:00:00.000Z',
          rating: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'a',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
        },
      ]);
      expect(response.body).toHaveLength(5);
    });

    it('when sortBy is rating than expected all movies response', async () => {
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            rating: 1,
            worthWatching: 2,
            name: 'a',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            rating: 2,
            worthWatching: 1,
            name: 'b',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            rating: 3,
            worthWatching: 0,
            name: 'c',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            rating: 4,
            worthWatching: 1,
            name: 'd',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            rating: 5,
            worthWatching: 2,
            name: 'e',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/movies?limit=${limit}&sortBy=${'rating'}`)
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
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 5,
          worthWatching: 2,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'd',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 4,
          worthWatching: 1,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'c',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 3,
          worthWatching: 0,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'b',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 2,
          worthWatching: 1,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'a',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 1,
          worthWatching: 2,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
      ]);
    });

    it('when name contains supplied than expected all movies response', async () => {
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'alive',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'horror',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'cat-die',
          },
        ),
      );
      const limit = 5;
      const nameContains = 'li';
      const response = await request(app.getHttpServer())
        .get(`/api/v1/movies?limit=${limit}&sortBy=${'rating'}&nameContains=${nameContains}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(1);
    });

    it('when the startsWith is exist than expected response', async () => {
      const movie = await moviesService.create(
        moviesFactory.build({
          name: 'GrEaT MoVie #9',
          status: MovieActiveStatus.Active,
        }),
      );
      const sortNameStartsWith = 'great';
      const limit = 3;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/movies?limit=${limit}&sortBy=${'name'}&startsWith=${sortNameStartsWith}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([{
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        name: movie.name,
        logo: 'http://localhost:4444/placeholders/movie_poster.png',
        releaseDate: movie.releaseDate.toISOString(),
        rating: 0,
        worthWatching: 0,
      }]);
    });

    it('when startsWith is not exist and nameContains is exist than expected response', async () => {
      await moviesService.create(
        moviesFactory.build({
          name: 'alive',
          status: MovieActiveStatus.Active,
        }),
      );
      const nameContains = 'li';
      const sortNameStartsWith = 'b';
      const limit = 3;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/movies?limit=${limit}&sortBy=${'name'}&nameContains=${nameContains}&startsWith=${sortNameStartsWith}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(0);
    });

    it('when startsWith is exist and nameContains is not exist than expected response', async () => {
      await moviesService.create(
        moviesFactory.build({
          name: 'alive',
          status: MovieActiveStatus.Active,
        }),
      );
      const nameContains = 'rr';
      const sortNameStartsWith = 'a';
      const limit = 3;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/movies?limit=${limit}&sortBy=${'name'}&nameContains=${nameContains}&startsWith=${sortNameStartsWith}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([]);
    });

    it('when startsWith and nameContains is exists than expected response', async () => {
      const movie0 = await moviesService.create(
        moviesFactory.build({
          name: 'alive',
          status: MovieActiveStatus.Active,
        }),
      );
      const movie1 = await moviesService.create(
        moviesFactory.build({
          name: 'The alive',
          status: MovieActiveStatus.Active,
        }),
      );
      const nameContains = 'li';
      const sortNameStartsWith = 'a';
      const limit = 3;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/movies?limit=${limit}&sortBy=${'name'}&nameContains=${nameContains}&startsWith=${sortNameStartsWith}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toEqual([{
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        name: movie0.name,
        logo: 'http://localhost:4444/placeholders/movie_poster.png',
        releaseDate: movie0.releaseDate.toISOString(),
        rating: 0,
        worthWatching: 0,
      },
      {
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        name: movie1.name,
        logo: 'http://localhost:4444/placeholders/movie_poster.png',
        releaseDate: movie1.releaseDate.toISOString(),
        rating: 0,
        worthWatching: 0,
      }]);
    });

    describe('when `after` argument is supplied', () => {
      beforeEach(async () => {
        const rating = [1, 2, 3, 4, 5];
        for (let i = 0; i < 5; i += 1) {
          await moviesService.create(
            moviesFactory.build(
              {
                status: MovieActiveStatus.Active,
                rating: rating[i],
              },
            ),
          );
        }
      });
      it('sort by name returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResponse = await request(app.getHttpServer())
          .get(`/api/v1/movies?limit=${limit}&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.status).toEqual(HttpStatus.OK);
        expect(firstResponse.body).toHaveLength(3);

        const secondResponse = await request(app.getHttpServer())
          .get(`/api/v1/movies?limit=${limit}&sortBy=${'name'}&after=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.status).toEqual(HttpStatus.OK);
        expect(secondResponse.body).toHaveLength(2);
      });

      it('sort by releaseDate returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResponse = await request(app.getHttpServer())
          .get(`/api/v1/movies?limit=${limit}&sortBy=${'releaseDate'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.status).toEqual(HttpStatus.OK);
        expect(firstResponse.body).toHaveLength(3);

        const secondResponse = await request(app.getHttpServer())
          .get(`/api/v1/movies?limit=${limit}&sortBy=${'releaseDate'}&after=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.status).toEqual(HttpStatus.OK);
        expect(secondResponse.body).toHaveLength(2);
      });

      it('sort by rating returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const rating = 'rating';
        const firstResponse = await request(app.getHttpServer())
          .get(`/api/v1/movies?limit=${limit}&sortBy=${rating}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.status).toEqual(HttpStatus.OK);
        expect(firstResponse.body).toHaveLength(3);

        const secondResponse = await request(app.getHttpServer())
          .get(`/api/v1/movies?limit=${limit}&sortBy=${rating}&after=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.status).toEqual(HttpStatus.OK);
        expect(secondResponse.body).toHaveLength(2);
      });
    });

    it('when sort_name startsWith with # than expected all movies response', async () => {
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: '#1915House',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: '!Alive',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'Blue$Whale',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: '(Captured)',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: '.Chadgetstheaxe',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: '>EATPRETTY',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: '???Float',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: '@FollowMe',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: '[funnyFACE',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: '`Horror',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: '~iKllr',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'MurderSelfie',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      const sortNameStartsWith = '%23';
      const limit = 20;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/movies?limit=${limit}&sortBy=${'name'}&startsWith=${sortNameStartsWith}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(10);
      expect(response.body).toEqual([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '#1915House',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthWatching: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '!Alive',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthWatching: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '(Captured)',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthWatching: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '.Chadgetstheaxe',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthWatching: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '>EATPRETTY',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthWatching: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '???Float',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthWatching: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '@FollowMe',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthWatching: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '[funnyFACE',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthWatching: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '`Horror',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthWatching: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: '~iKllr',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
          worthWatching: 0,
        },
      ]);
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/movies?&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/movies?limit=${limit}&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('returns an error if the limit is higher than allowed', async () => {
        const limit = 61;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/movies?limit=${limit}&sortBy=${'releasedate'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 60');
      });

      it('sortBy should not be empty', async () => {
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/movies?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('sortBy should not be empty');
      });

      it('sortBy must be one of the following values: name, releaseDate, rating', async () => {
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/movies?limit=${limit}&sortBy=${'tests'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('sortBy must be one of the following values: name, releaseDate, rating');
      });

      it('responds with error message when an invalid startsWith supplied', async () => {
        const startsWith = '@qw$re';
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/movies?limit=${limit}&sortBy=${'name'}&startsWith=${startsWith}`)
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
