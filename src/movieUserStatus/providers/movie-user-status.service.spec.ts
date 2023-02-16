import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { MovieUserStatusService } from './movie-user-status.service';
import { MovieUserStatus, MovieUserStatusDocument } from '../../schemas/movieUserStatus/movieUserStatus.schema';
import { MovieUserStatusBuy, MovieUserStatusFavorites, MovieUserStatusWatch, MovieUserStatusWatched } from '../../schemas/movieUserStatus/movieUserStatus.enums';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { MoviesService } from '../../movies/providers/movies.service';
import { UsersService } from '../../users/providers/users.service';
import { MovieActiveStatus } from '../../schemas/movie/movie.enums';
import { moviesFactory } from '../../../test/factories/movies.factory';
import { userFactory } from '../../../test/factories/user.factory';

describe('MovieUserStatusService', () => {
  let app: INestApplication;
  let connection: Connection;
  let movieUserStatusService: MovieUserStatusService;
  let movieUserStatusModel: Model<MovieUserStatusDocument>;
  let moviesService: MoviesService;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    movieUserStatusService = moduleRef.get<MovieUserStatusService>(MovieUserStatusService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    usersService = moduleRef.get<UsersService>(UsersService);
    movieUserStatusModel = moduleRef.get<Model<MovieUserStatusDocument>>(getModelToken(MovieUserStatus.name));
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let activeUser;
  let movie;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    movie = await moviesService.create(
      moviesFactory.build(
        {
          status: MovieActiveStatus.Active,
        },
      ),
    );
    activeUser = await usersService.create(
      userFactory.build(),
    );
    await movieUserStatusModel.create({
      name: "movie user status1",
      userId: activeUser._id,
      movieId: movie._id,
      favorite: 0,
      watched: 0,
      watch: 0,
      buy: 0
    });
  });

  it('should be defined', () => {
    expect(movieUserStatusService).toBeDefined();
  });

  describe('#addMovieUserStatusFavorite', () => {
    it('successfully creates a add movie user status favorite', async () => {
      await movieUserStatusService.addMovieUserStatusFavorite(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString())
      expect(movieUserStatus.favourite).toBe(MovieUserStatusFavorites.Favorite);
    });
  });

  describe('#deleteMovieUserStatusFavorite', () => {
    it('successfully delete a add movie user status favorite', async () => {
      await movieUserStatusService.deleteMovieUserStatusFavorite(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString())
      expect(movieUserStatus.favourite).toBe(MovieUserStatusFavorites.NotFavorite);
    });
  });

  describe('#addMovieUserStatusWatch', () => {
    it('successfully creates a add movie user status watch', async () => {
      await movieUserStatusService.addMovieUserStatusWatch(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString())
      expect(movieUserStatus.watch).toBe(MovieUserStatusWatch.Watch);
    });
  });

  describe('#deleteMovieUserStatusWatch', () => {
    it('successfully delete a add movie user status watch', async () => {
      await movieUserStatusService.deleteMovieUserStatusWatch(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString())
      expect(movieUserStatus.watch).toBe(MovieUserStatusWatch.NotWatch);
    });
  });

  describe('#addMovieUserStatusWatched', () => {
    it('successfully creates a add movie user status watched', async () => {
      await movieUserStatusService.addMovieUserStatusWatched(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString())
      expect(movieUserStatus.watched).toBe(MovieUserStatusWatched.Watched);
    });
  });

  describe('#deleteMovieUserStatusWatched', () => {
    it('successfully delete a add movie user status watched', async () => {
      await movieUserStatusService.deleteMovieUserStatusWatched(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString())
      expect(movieUserStatus.watched).toBe(MovieUserStatusWatched.NotWatched);
    });
  });

  describe('#addMovieUserStatusBuy', () => {
    it('successfully creates a add movie user status buy', async () => {
      await movieUserStatusService.addMovieUserStatusBuy(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString())
      expect(movieUserStatus.buy).toBe(MovieUserStatusBuy.Buy);
    });
  });

  describe('#deleteMovieUserStatusBuy', () => {
    it('successfully delete a add movie user status buy', async () => {
      await movieUserStatusService.deleteMovieUserStatusBuy(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString())
      expect(movieUserStatus.buy).toBe(MovieUserStatusBuy.NotBuy);
    });
  });


});
