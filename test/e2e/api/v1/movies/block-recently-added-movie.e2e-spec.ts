import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { moviesFactory } from '../../../../factories/movies.factory';
import { MoviesService } from '../../../../../src/movies/providers/movies.service';
import { userFactory } from '../../../../factories/user.factory';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { MovieActiveStatus } from '../../../../../src/schemas/movie/movie.enums';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { RecentMovieBlock } from '../../../../../src/schemas/recentMovieBlock/recentMovieBlock.schema';
import { RecentMovieBlockReaction } from '../../../../../src/schemas/recentMovieBlock/recentMovieBlock.enums';

describe('Movie / Block recently added movie (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let moviesService: MoviesService;
  let recentMovieBlockModel: Model<RecentMovieBlock>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    configService = moduleRef.get<ConfigService>(ConfigService);
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

  describe('POST /api/v1/movies/recent/block', () => {
    let movie;
    beforeEach(async () => {
      movie = await moviesService.create(
        moviesFactory.build({
          status: MovieActiveStatus.Active,
          logo: null,
        }),
      );
      await recentMovieBlockModel.create({
        from: activeUser._id,
        movieId: movie._id,
        reaction: RecentMovieBlockReaction.Unblock,
      });
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer()).post('/api/v1/movies/recent/block').expect(HttpStatus.UNAUTHORIZED);
    });

    it('creates the recent movie block data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/movies/recent/block')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send({ movieId: movie._id.toString() });
      expect(response.status).toEqual(HttpStatus.CREATED);
      expect(response.body).toEqual({ success: true });
    });

    describe('Validation', () => {
      it('movieId must be a mongodb id', async () => {
        const movieId = '634912b22c2f4*5e0e62285';
        const response = await request(app.getHttpServer())
          .post('/api/v1/movies/recent/block')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send({ movieId });
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'movieId must be a mongodb id',
          ],
          statusCode: 400,
        });
      });

      it('when movieId is not given it give below error', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/movies/recent/block')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'movieId must be a mongodb id',
            'movieId should not be empty',
          ],
          statusCode: 400,
        });
      });
    });
  });
});
