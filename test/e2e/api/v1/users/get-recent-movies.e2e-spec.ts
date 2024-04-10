/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { DateTime } from 'luxon';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
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
import { RecentMovieBlock } from '../../../../../src/schemas/recentMovieBlock/recentMovieBlock.schema';
import { RecentMovieBlockReaction } from '../../../../../src/schemas/recentMovieBlock/recentMovieBlock.enums';
import { MovieUserStatus, MovieUserStatusDocument } from '../../../../../src/schemas/movieUserStatus/movieUserStatus.schema';

describe('Get Recent Movies (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let moviesService: MoviesService;
  let recentMovieBlockModel: Model<RecentMovieBlock>;
  let movieUserStatusModel: Model<MovieUserStatusDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    movieUserStatusModel = moduleRef.get<Model<MovieUserStatusDocument>>(getModelToken(MovieUserStatus.name));
    recentMovieBlockModel = moduleRef.get<Model<RecentMovieBlock>>(getModelToken(RecentMovieBlock.name));
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

  describe('GET /api/v1/users/recent-movies', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/users/recent-movies').expect(HttpStatus.UNAUTHORIZED);
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
        .get('/api/v1/users/recent-movies')
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
        .get('/api/v1/users/recent-movies')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(0);
    });

    it('returns the recent movie list', async () => {
      const movie = await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            logo: '/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
            name: 'horror',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      const movie1 = await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            logo: '/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
            name: 'horror 1',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      const movie2 = await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            logo: '/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
            name: 'horror 2',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      const movie3 = await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            logo: '/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
            name: 'horror 3',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      const movie4 = await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            logo: '/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
            name: 'horror 4',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            logo: '/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
            name: 'horror 5',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            logo: '/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
            name: 'horror 6',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            logo: '/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
            name: 'horror 7',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            logo: '/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
            name: 'horror 8',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            logo: '/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
            name: 'horror 9',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
            logo: '/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
            name: 'horror 10',
            releaseDate: DateTime.fromISO('2022-10-17T00:00:00Z').toJSDate(),
          },
        ),
      );
      await recentMovieBlockModel.create({
        from: activeUser._id,
        movieId: movie._id,
        reaction: RecentMovieBlockReaction.Block,
      });
      await recentMovieBlockModel.create({
        from: activeUser._id,
        movieId: movie1._id,
        reaction: RecentMovieBlockReaction.Block,
      });
      await movieUserStatusModel.create({
        name: 'movie user status1',
        userId: activeUser._id,
        movieId: movie2._id,
        favourite: 0,
        watched: 0,
        watch: 1,
        buy: 0,
      });
      await movieUserStatusModel.create({
        name: 'movie user status1',
        userId: activeUser._id,
        movieId: movie3._id,
        favourite: 0,
        watched: 0,
        watch: 1,
        buy: 0,
      });
      await movieUserStatusModel.create({
        name: 'movie user status1',
        userId: activeUser._id,
        movieId: movie4._id,
        favourite: 0,
        watched: 1,
        watch: 1,
        buy: 0,
      });
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/recent-movies')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.body).toHaveLength(6);
      expect(response.body).toEqual([
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'horror 10',
          logo: 'https://image.tmdb.org/t/p/w220_and_h330_face/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
          rating: 0,
          worthWatching: 0,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'horror 9',
          logo: 'https://image.tmdb.org/t/p/w220_and_h330_face/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
          rating: 0,
          worthWatching: 0,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'horror 8',
          logo: 'https://image.tmdb.org/t/p/w220_and_h330_face/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
          rating: 0,
          worthWatching: 0,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'horror 7',
          logo: 'https://image.tmdb.org/t/p/w220_and_h330_face/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
          rating: 0,
          worthWatching: 0,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'horror 6',
          logo: 'https://image.tmdb.org/t/p/w220_and_h330_face/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
          rating: 0,
          worthWatching: 0,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
        {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          name: 'horror 5',
          logo: 'https://image.tmdb.org/t/p/w220_and_h330_face/dtRbVsUb5O12WWO54SRpiMtHKC0.jpg',
          rating: 0,
          worthWatching: 0,
          releaseDate: '2022-10-17T00:00:00.000Z',
        },
      ]);
    });
  });
});
