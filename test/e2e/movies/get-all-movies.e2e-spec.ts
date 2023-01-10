/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { MoviesService } from '../../../src/movies/providers/movies.service';
import { moviesFactory } from '../../factories/movies.factory';
import { MovieActiveStatus } from '../../../src/schemas/movie/movie.enums';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';

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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('All Movies Details', () => {
    it('transforms the logo field into a full Movie DB URL', async () => {
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active, name: 'a', logo: '/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .get('/movies?limit=1&sortBy=name')
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
        .get('/movies?limit=1&sortBy=name')
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
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'b',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'c',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'd',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'e',
          },
        ),
      );
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/movies?limit=${limit}&sortBy=${'name'}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      for (let i = 1; i < response.body.length; i += 1) {
        expect(response.body[i - 1].name < response.body[i].name).toBe(true);
      }
      expect(response.body).toHaveLength(5);
      expect(response.body).toMatchObject([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'a',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'b',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'c',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'd',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'e',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 0,
        },
      ]);
    });

    it('when sortBy is releaseDate than expected all movies response', async () => {
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
            name: 'e',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            releaseDate: DateTime.fromISO('2022-10-18T00:00:00Z').toJSDate(),
            name: 'e',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            releaseDate: DateTime.fromISO('2022-10-19T00:00:00Z').toJSDate(),
            name: 'e',
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
            name: 'e',
          },

        ),
      );
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/movies?limit=${limit}&sortBy=${'releaseDate'}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      for (let i = 1; i < response.body.length; i += 1) {
        expect(response.body[i - 1].releaseDate < response.body[i].releaseDate).toBe(true);
      }
      expect(response.body).toMatchObject([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'e',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-17T00:00:00.000Z',
          rating: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'e',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-18T00:00:00.000Z',
          rating: 0,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'e',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-19T00:00:00.000Z',
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
          name: 'e',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          releaseDate: '2022-10-21T00:00:00.000Z',
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
            name: 'a',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            rating: 2,
            name: 'b',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            rating: 3,
            name: 'c',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            rating: 4,
            name: 'd',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            rating: 5,
            name: 'e',
          },
        ),
      );
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/movies?limit=${limit}&sortBy=${'rating'}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      for (let i = 1; i < response.body.length; i += 1) {
        expect(response.body[i].rating < response.body[i - 1].rating).toBe(true);
      }
      expect(response.body).toHaveLength(5);
      expect(response.body).toMatchObject([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'e',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 5,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'd',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 4,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'c',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 3,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'b',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 2,
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'a',
          logo: 'http://localhost:4444/placeholders/movie_poster.png',
          rating: 1,
        },
      ]);
    });

    it('when name contains supplied than expected all movies response', async () => {
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'a',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'b',
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            name: 'c',
          },
        ),
      );
      const limit = 5;
      const nameContains = 'c';
      const response = await request(app.getHttpServer())
        .get(`/movies?limit=${limit}&sortBy=${'rating'}&nameContains=${nameContains}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(1);
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
          .get(`/movies?limit=${limit}&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.status).toEqual(HttpStatus.OK);
        expect(firstResponse.body).toHaveLength(3);

        const secondResponse = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}&sortBy=${'name'}&after=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.status).toEqual(HttpStatus.OK);
        expect(secondResponse.body).toHaveLength(2);
      });

      it('sort by releaseDate returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResponse = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}&sortBy=${'releaseDate'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.status).toEqual(HttpStatus.OK);
        expect(firstResponse.body).toHaveLength(3);

        const secondResponse = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}&sortBy=${'releaseDate'}&after=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.status).toEqual(HttpStatus.OK);
        expect(secondResponse.body).toHaveLength(2);
      });

      it('sort by rating returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const rating = 'rating';
        const firstResponse = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}&sortBy=${rating}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.status).toEqual(HttpStatus.OK);
        expect(firstResponse.body).toHaveLength(3);

        const secondResponse = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}&sortBy=${rating}&after=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.status).toEqual(HttpStatus.OK);
        expect(secondResponse.body).toHaveLength(2);
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/movies?&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}&sortBy=${'name'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 20', async () => {
        const limit = 21;
        const response = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}&sortBy=${'releasedate'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 20');
      });

      it('sortBy should not be empty', async () => {
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('sortBy should not be empty');
      });

      it('sortBy must be one of the following values: name, releaseDate, rating', async () => {
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/movies?limit=${limit}&sortBy=${'tests'}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('sortBy must be one of the following values: name, releaseDate, rating');
      });
    });
  });
});
