import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { MovieUserStatusService } from './movie-user-status.service';
import { MovieUserStatus, MovieUserStatusDocument } from '../../schemas/movieUserStatus/movieUserStatus.schema';
import {
  MovieUserStatusBuy, MovieUserStatusFavorites, MovieUserStatusWatch, MovieUserStatusWatched,
} from '../../schemas/movieUserStatus/movieUserStatus.enums';
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
  let user0;
  let user1;
  let user2;
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
    user0 = await usersService.create(
      userFactory.build(),
    );
    user1 = await usersService.create(
      userFactory.build(),
    );
    user2 = await usersService.create(
      userFactory.build(),
    );
    await movieUserStatusModel.create({
      userId: activeUser._id,
      movieId: movie._id,
    });
    await movieUserStatusModel.create({
      userId: user0._id,
      movieId: movie._id,
    });
    await movieUserStatusModel.create({
      userId: user1._id,
      movieId: movie._id,
    });
    await movieUserStatusModel.create({
      userId: user2._id,
      movieId: movie._id,
    });
  });

  it('should be defined', () => {
    expect(movieUserStatusService).toBeDefined();
  });

  describe('#addMovieUserStatusFavorite', () => {
    it('successfully creates a add movie user status favorite', async () => {
      await movieUserStatusService.addMovieUserStatusFavorite(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString());
      expect(movieUserStatus.favourite).toBe(MovieUserStatusFavorites.Favorite);
    });
  });

  describe('#deleteMovieUserStatusFavorite', () => {
    it('successfully delete a add movie user status favorite', async () => {
      await movieUserStatusService.deleteMovieUserStatusFavorite(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString());
      expect(movieUserStatus.favourite).toBe(MovieUserStatusFavorites.NotFavorite);
    });
  });

  describe('#addMovieUserStatusWatch', () => {
    it('successfully creates a add movie user status watch', async () => {
      await movieUserStatusService.addMovieUserStatusWatch(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString());
      expect(movieUserStatus.watch).toBe(MovieUserStatusWatch.Watch);
    });
  });

  describe('#deleteMovieUserStatusWatch', () => {
    it('successfully delete a add movie user status watch', async () => {
      await movieUserStatusService.deleteMovieUserStatusWatch(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString());
      expect(movieUserStatus.watch).toBe(MovieUserStatusWatch.NotWatch);
    });
  });

  describe('#addMovieUserStatusWatched', () => {
    it('successfully creates a add movie user status watched', async () => {
      await movieUserStatusService.addMovieUserStatusWatched(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString());
      expect(movieUserStatus.watched).toBe(MovieUserStatusWatched.Watched);
    });
  });

  describe('#deleteMovieUserStatusWatched', () => {
    it('successfully delete a add movie user status watched', async () => {
      await movieUserStatusService.deleteMovieUserStatusWatched(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString());
      expect(movieUserStatus.watched).toBe(MovieUserStatusWatched.NotWatched);
    });
  });

  describe('#addMovieUserStatusBuy', () => {
    it('successfully creates a add movie user status buy', async () => {
      await movieUserStatusService.addMovieUserStatusBuy(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString());
      expect(movieUserStatus.buy).toBe(MovieUserStatusBuy.Buy);
    });
  });

  describe('#deleteMovieUserStatusBuy', () => {
    it('successfully delete a add movie user status buy', async () => {
      await movieUserStatusService.deleteMovieUserStatusBuy(activeUser._id.toString(), movie._id.toString());
      const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString());
      expect(movieUserStatus.buy).toBe(MovieUserStatusBuy.NotBuy);
    });
  });

  describe('#findMovieUserStatus', () => {
    it('successfully find a add movie user status', async () => {
      const movieUserStatusData = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString());
      expect(movieUserStatusData.userId.toString()).toBe(activeUser.id);
    });
  });

  describe('#findAllMovieUserStatus', () => {
    it('successfully find a all movie user status', async () => {
      const user = [activeUser.id, user0.id, user1.id, user2.id];
      const movieUserStatusData = await movieUserStatusService.findAllMovieUserStatus(user, movie._id.toString());
      expect(movieUserStatusData[0].userId.toString()).toBe(activeUser.id);
      expect(movieUserStatusData[1].userId.toString()).toBe(user0.id);
      expect(movieUserStatusData[2].userId.toString()).toBe(user1.id);
      expect(movieUserStatusData[3].userId.toString()).toBe(user2.id);
    });
  });
});
