/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { EventEmitter } from 'stream';
import { readdirSync } from 'fs';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { createTempFiles } from '../../../../helpers/tempfile-helpers';
import { User } from '../../../../../src/schemas/user/user.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { Hashtag, HashtagDocument } from '../../../../../src/schemas/hastag/hashtag.schema';
import { PostType } from '../../../../../src/schemas/feedPost/feedPost.enums';
import { MoviesService } from '../../../../../src/movies/providers/movies.service';
import { moviesFactory } from '../../../../factories/movies.factory';
import { MovieActiveStatus } from '../../../../../src/schemas/movie/movie.enums';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';

describe('Feed-Post / Post File (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let moviesService: MoviesService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let hashtagModel: Model<HashtagDocument>;
  let feedPostsService: FeedPostsService;

  beforeAll(async () => {
    //set max listeners value 12 because it required 12 images in 'only allows a maximum of 10 images'
    EventEmitter.setMaxListeners(12);
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    hashtagModel = moduleRef.get<Model<HashtagDocument>>(getModelToken(Hashtag.name));

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
  });

  describe('POST /api/v1/feed-posts', () => {
    let movie;
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      activeUserAuthToken = activeUser.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );
      movie = await moviesService.create(
        moviesFactory.build(
          {
            status: MovieActiveStatus.Active,
          },
        ),
      );
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer()).post('/api/v1/feed-posts').expect(HttpStatus.UNAUTHORIZED);
    });

    it('successfully creates feed posts with a message and files', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('postType', PostType.User)
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .attach('files', tempPaths[2])
          .attach('files', tempPaths[3])
          .expect(HttpStatus.CREATED);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'hello test user',
          postType: PostType.User,
          spoilers: false,
          userId: activeUser._id.toString(),
          images: [
            {
              image_path: expect.stringMatching(/api\/v1\/local-storage\/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/api\/v1\/local-storage\/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/api\/v1\/local-storage\/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/api\/v1\/local-storage\/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
          ],
        });
      }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('responds expected response when one or more uploads files user an unallowed extension', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .attach('files', tempPaths[2])
          .attach('files', tempPaths[3])
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Invalid file type');
      }, [{ extension: 'png' }, { extension: 'tjpg' }, { extension: 'tjpg' }, { extension: 'zpng' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('allows the creation of a post with only a message, but no files', async () => {
      const message = 'This is a test message';
      const response = await request(app.getHttpServer())
        .post('/api/v1/feed-posts')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', message)
        .field('postType', PostType.User)
        .field('userId', activeUser._id.toString())
        .expect(HttpStatus.CREATED);
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        message: 'This is a test message',
        postType: PostType.User,
        userId: activeUser._id.toString(),
        images: [],
        spoilers: false,
      });
    });

    it('allows the creation of a post with only files, but no message', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('userId', activeUser._id.toString())
          .field('postType', PostType.User)
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .expect(HttpStatus.CREATED);
        expect(response.body.images).toHaveLength(2);
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('responds expected response when neither message nor file are present in request', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/feed-posts')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('message', '')
        .field('postType', PostType.User)
        .expect(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toBe('Posts must have some text or at least one image.');
    });

    it('only allows a maximum of 10 images', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .attach('files', tempPaths[2])
          .attach('files', tempPaths[3])
          .attach('files', tempPaths[4])
          .attach('files', tempPaths[5])
          .attach('files', tempPaths[6])
          .attach('files', tempPaths[7])
          .attach('files', tempPaths[8])
          .attach('files', tempPaths[9])
          .attach('files', tempPaths[10])
          .attach('files', tempPaths[11])
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({ statusCode: 400, message: 'Too many files uploaded. Maximum allowed: 10' });
      }, [
        { extension: 'png' },
        { extension: 'png' },
        { extension: 'png' },
        { extension: 'png' },
        { extension: 'jpg' },
        { extension: 'jpg' },
        { extension: 'jpg' },
        { extension: 'jpg' },
        { extension: 'gif' },
        { extension: 'gif' },
        { extension: 'gif' },
        { extension: 'gif' },
      ]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('responds expected response if file size should not larger than 20MB', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .expect(HttpStatus.PAYLOAD_TOO_LARGE);
        expect(response.body.message).toBe('File too large');
      }, [{ extension: 'png' }, { extension: 'jpg', size: 1024 * 1024 * 21 }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('check message length validation', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', new Array(20_002).join('z'))
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('message cannot be longer than 20,000 characters');
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when # is exists on message string than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'test user#ok #slasher #nothing #ok')
          .field('postType', PostType.User)
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0]);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'test user#ok #slasher #nothing #ok',
          userId: activeUser._id.toString(),
          postType: PostType.User,
          spoilers: false,
          images: [
            {
              image_path: expect.stringMatching(/api\/v1\/local-storage\/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
          ],
        });

        const feedPost = await feedPostsService.findById(response.body._id, true);
        expect(feedPost.hashtags).toEqual(['ok', 'slasher', 'nothing']);

        const hashtags = await hashtagModel.find({ name: { $in: feedPost.hashtags } });
        expect(hashtags[0].name).toEqual(feedPost.hashtags[0]);
        expect(hashtags[1].name).toEqual(feedPost.hashtags[1]);
        expect(hashtags[2].name).toEqual(feedPost.hashtags[2]);
      }, [{ extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('only allows a maximum of 10 hashtags', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'test user#ok #slasher #nothing #okay #best #not #go #run #fast #good #buy')
          .field('userId', activeUser._id.toString())
          .field('postType', PostType.User)
          .attach('files', tempPaths[0]);
        expect(response.body).toEqual({
          statusCode: 400,
          message: 'you can not add more than 10 hashtags on a post',
        });
      }, [{ extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when movieId is exits than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'this new post')
          .field('postType', PostType.User)
          .field('userId', activeUser._id.toString())
          .field('movieId', movie._id.toString())
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1]);
        const post = await feedPostsService.findById(response.body._id, true);
        expect(post.movieId).toEqual(movie._id);
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when moviePostFields is exits but postType is User than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'this new post')
          .field('postType', PostType.User)
          .field('userId', activeUser._id.toString())
          .field('movieId', movie._id.toString())
          .field('moviePostFields[spoilers]', true)
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1]);
        expect(response.body).toEqual({
          statusCode: 400,
          message: 'When submitting moviePostFields, post type must be MovieReview.',
        });
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when moviePostFields is exits but movieId is not exist in post than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'this new post')
          .field('postType', PostType.MovieReview)
          .field('userId', activeUser._id.toString())
          .field('moviePostFields[spoilers]', true)
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1]);
        expect(response.body).toEqual({
          statusCode: 400,
          message: 'When submitting moviePostFields, movieId is required.',
        });
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when moviePostFields is exits than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'this new post')
          .field('postType', PostType.MovieReview)
          .field('userId', activeUser._id.toString())
          .field('movieId', movie._id.toString())
          .field('moviePostFields[spoilers]', true)
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1]);
        const post = await feedPostsService.findById(response.body._id, true);
        expect(post.spoilers).toBe(true);
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('check trim is working for message in create feed posts', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/feed-posts')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('message', '     this new post   ')
        .field('userId', activeUser._id.toString())
        .field('postType', PostType.MovieReview);
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        message: 'this new post',
        spoilers: false,
        userId: activeUser._id.toString(),
        images: [],
        postType: PostType.MovieReview,
      });
    });

    it('returns the expected response when the message only contains whitespace characters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/feed-posts')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('message', '     \n\n')
        .field('userId', activeUser._id.toString())
        .field('postType', PostType.User);
      expect(response.body).toEqual({
        statusCode: 400,
        message: 'Posts must have some text or at least one image.',
      });
    });

    it('when postType is movieReview and message is empty string than expected response', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/feed-posts')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', '')
        .field('postType', PostType.MovieReview)
        .field('userId', activeUser._id.toString());
      expect(response.body).toEqual(
        { statusCode: 400, message: 'Review must have a some text' },
      );
    });

    describe('notifications', () => {
      it('when notification is create for createFeedPost than check newNotificationCount is increment in user', async () => {
        const otherUser1 = await usersService.create(userFactory.build({ userName: 'Denial' }));

        await createTempFiles(async (tempPaths) => {
          await request(app.getHttpServer())
            .post('/api/v1/feed-posts')
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .field(
              'message',
              `##LINK_ID##${otherUser1._id.toString()}@Denial##LINK_END## other user 1`,
            )
            .field('postType', PostType.User)
            .field('userId', activeUser._id.toString())
            .attach('files', tempPaths[0])
            .expect(HttpStatus.CREATED);

          const otherUser1NewNotificationCount = await usersService.findById(otherUser1.id);
          expect(otherUser1NewNotificationCount.newNotificationCount).toBe(1);
        }, [{ extension: 'png' }]);
        // There should be no files in `UPLOAD_DIR` (other than one .keep file)
        const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
        expect(allFilesNames).toEqual(['.keep']);
      });
    });

    describe('Validation', () => {
      it('spoilers should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('userId', activeUser._id.toString())
          .field('postType', 3)
          .field('moviePostFields[rating]', 1);
        expect(response.body.message).toContain('spoilers should not be empty');
      });

      it('rating must not be greater than 5', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('userId', activeUser._id.toString())
          .field('postType', 3)
          .field('moviePostFields[spoilers]', true)
          .field('moviePostFields[rating]', 6);
        expect(response.body.message).toContain('rating must be less than 5');
      });

      it('rating must not be less than 1', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('userId', activeUser._id.toString())
          .field('postType', 3)
          .field('moviePostFields[spoilers]', true)
          .field('moviePostFields[rating]', 0);
        expect(response.body.message).toContain('rating must be greater than 1');
      });

      it('goreFactorRating must not be greater than 5', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('userId', activeUser._id.toString())
          .field('postType', 3)
          .field('moviePostFields[spoilers]', true)
          .field('moviePostFields[goreFactorRating]', 6);
        expect(response.body.message).toContain('goreFactorRating must be less than 5');
      });

      it('goreFactorRating must not be less than 1', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('userId', activeUser._id.toString())
          .field('postType', 3)
          .field('moviePostFields[spoilers]', true)
          .field('moviePostFields[goreFactorRating]', 0);
        expect(response.body.message).toContain('goreFactorRating must be greater than 1');
      });

      it('worthWatching must be one of the following values: 1, 2', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('userId', activeUser._id.toString())
          .field('postType', 3)
          .field('moviePostFields[spoilers]', true)
          .field('moviePostFields[worthWatching]', 6);
        expect(response.body.message).toContain('worthWatching must be one of the following values: 1, 2');
      });

      it('postType should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('userId', activeUser._id.toString());
        expect(response.body.message).toContain('postType should not be empty');
      });

      it('postType must be one of the following values: 3, 2, 1', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/feed-posts')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('userId', activeUser._id.toString())
          .field('postType', 4);
        expect(response.body.message).toContain('postType must be one of the following values: 3, 2, 1');
      });
    });
  });
});
