/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { EventEmitter } from 'stream';
import { readdirSync } from 'fs';
import { BookActiveStatus } from '../../../../../src/schemas/book/book.enums';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { FeedPostsService } from '../../../../../src/feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../../factories/feed-post.factory';
import { FeedPostDocument } from '../../../../../src/schemas/feedPost/feedPost.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { createTempFiles } from '../../../../helpers/tempfile-helpers';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { Hashtag, HashtagDocument } from '../../../../../src/schemas/hastag/hashtag.schema';
import { HashtagService } from '../../../../../src/hashtag/providers/hashtag.service';
import { MoviesService } from '../../../../../src/movies/providers/movies.service';
import { moviesFactory } from '../../../../factories/movies.factory';
import { MovieActiveStatus } from '../../../../../src/schemas/movie/movie.enums';
import { PostType } from '../../../../../src/schemas/feedPost/feedPost.enums';
import { MovieUserStatusService } from '../../../../../src/movie-user-status/providers/movie-user-status.service';
import { WorthReadingStatus, WorthWatchingStatus } from '../../../../../src/types';
import { UserSettingsService } from '../../../../../src/settings/providers/user-settings.service';
import { userSettingFactory } from '../../../../factories/user-setting.factory';
import { BooksService } from '../../../../../src/books/providers/books.service';
import { booksFactory } from '../../../../factories/books.factory';
import { BookUserStatusService } from '../../../../../src/book-user-status/providers/book-user-status.service';

describe('Update Feed Post (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let user1: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let hashtagService: HashtagService;
  let feedPost: FeedPostDocument;
  let hashtagModel: Model<HashtagDocument>;
  let moviesService: MoviesService;
  let booksService: BooksService;
  let movieUserStatusService: MovieUserStatusService;
  let bookUserStatusService: BookUserStatusService;
  let userSettingsService: UserSettingsService;

  const sampleFeedPostObject = {
    message: 'hello all test user upload your feed post',
  };

  beforeAll(async () => {
    //set max listeners value 12 because it required 12 images in 'only allows a maximum of 10 images'
    EventEmitter.setMaxListeners(12);
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    moviesService = moduleRef.get<MoviesService>(MoviesService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    hashtagService = moduleRef.get<HashtagService>(HashtagService);
    hashtagModel = moduleRef.get<Model<HashtagDocument>>(getModelToken(Hashtag.name));
    movieUserStatusService = moduleRef.get<MovieUserStatusService>(MovieUserStatusService);
    bookUserStatusService = moduleRef.get<BookUserStatusService>(BookUserStatusService);
    booksService = moduleRef.get<BooksService>(BooksService);
    userSettingsService = moduleRef.get<UserSettingsService>(UserSettingsService);
    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let feedPost4;
  let movie;
  let book;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
    activeUser = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    feedPost = await feedPostsService.create(
      feedPostFactory.build(
        {
          userId: activeUser._id,
        },
      ),
    );
    feedPost4 = await feedPostsService.create(
      feedPostFactory.build(
        {
          userId: activeUser._id,
          message: 'test user#ok #Slasher post',
          hashtags: ['ok', 'slasher'],
        },
      ),
    );
    await hashtagService.createOrUpdateHashtags(feedPost4.hashtags);
    movie = await moviesService.create(
      moviesFactory.build(
        {
          status: MovieActiveStatus.Active,
        },
      ),
    );
    book = await booksService.create(booksFactory.build({
      status: BookActiveStatus.Active,
    }));
  });

  describe('PATCH /api/v1/feed-posts/:id', () => {
    it('requires authentication', async () => {
      const feedPostId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).patch(`/api/v1/feed-posts/${feedPostId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    it('successfully update feed post details, and updates the lastUpdateAt time', async () => {
      const postBeforeUpdate = await feedPostsService.findById(feedPost.id, true);
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', sampleFeedPostObject.message);
      const feedPostDetails = await feedPostsService.findById(response.body._id, true);
      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        message: 'hello all test user upload your feed post',
        userId: activeUser._id.toString(),
        hashtags: [],
        images: [
          {
            image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
            description: 'this is test description',
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          },
          {
            image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
            description: 'this is test description',
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          },
        ],
        spoilers: false,
      });
      expect(feedPostDetails.lastUpdateAt > postBeforeUpdate.lastUpdateAt).toBe(true);
    });

    it('when userId is not match than expected feed post response', async () => {
      const feedPostDetails = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: user1._id,
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPostDetails._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('message', 'hello test user');
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body.message).toBe('You can only edit a post that you created.');
    });

    it('when feed post is not found, returns the expected feed post response', async () => {
      const feedPostDetails = '634fc8d86a5897b88a2d9753';
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPostDetails}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('message', 'hello test user');
      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
      expect(response.body.message).toBe('Post not found');
    });

    it('when imagesToDelete is exist than check files length, return the expected response', async () => {
      const feedPost1 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
          },
        ),
      );
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost1._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('imagesToDelete', (feedPost1.images[0] as any).id)
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .attach('files', tempPaths[2])
          .attach('files', tempPaths[3])
          .attach('files', tempPaths[4])
          .attach('files', tempPaths[5])
          .attach('files', tempPaths[6])
          .attach('files', tempPaths[7])
          .attach('files', tempPaths[8])
          .attach('files', tempPaths[9]);
        expect(response.body).toEqual({
          statusCode: 400,
          message: 'Cannot include more than 10 images on a post.',
        });
      }, [
        { extension: 'png' }, { extension: 'png' }, { extension: 'png' },
        { extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' },
        { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'gif' },
        { extension: 'gif' },
      ]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when imagesToDelete and files is exist than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .field('imagesToDelete', (feedPost.images[0] as any).id)
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .field('imageDescriptions[0][description]', 'this is update post description 0')
          .field('imageDescriptions[1][description]', 'this is update post description 1');
        const feedPostDetails = await feedPostsService.findById(response.body._id, true);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'hello test user',
          userId: activeUser._id.toString(),
          hashtags: [],
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is update post description 0',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is update post description 1',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is test description',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
          ],
          spoilers: false,
        });
        expect(feedPostDetails.images).toHaveLength(3);
      }, [{ extension: 'png' }, { extension: 'png' }]);
      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when imagesToDelete id not exist and files is exist than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .field('imageDescriptions[0][description]', 'this is update post description 0')
          .field('imageDescriptions[1][description]', 'this is update post description 1');
        const feedPostDetails = await feedPostsService.findById(response.body._id, true);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'hello test user',
          userId: activeUser._id.toString(),
          hashtags: [],
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is update post description 0',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is update post description 1',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is test description',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is test description',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
          ],
          spoilers: false,
        });
        expect(feedPostDetails.images).toHaveLength(4);
      }, [{ extension: 'png' }, { extension: 'png' }]);
      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when imagesToDelete id exist and files is not exist than expected response', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('imagesToDelete', (feedPost.images[0] as any).id)
        .field('message', 'hello test user');
      const feedPostDetails = await feedPostsService.findById(response.body._id, true);
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        message: 'hello test user',
        userId: activeUser._id.toString(),
        hashtags: [],
        images: [
          {
            image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
            description: 'this is test description',
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          },
        ],
        spoilers: false,
      });
      expect(feedPostDetails.images).toHaveLength(1);
    });

    it('only allows a maximum of 10 images', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
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
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Too many files uploaded. Maximum allowed: 10');
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
      ]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('responds expected response when neither message nor file are present in request'
      + 'and db images length or body imagesToDelete length is same', async () => {
        const feedPost0 = await feedPostsService.create(
          feedPostFactory.build(
            {
              images: [{
                image_path: '/feed/feed_sample1.jpg',
                description: 'this feed comment description 1',
              }],
              userId: activeUser._id,
            },
          ),
        );
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost0._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .field('message', '')
          .field('imagesToDelete', (feedPost.images[0] as any).id)
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toBe('Posts must have some text or at least one image.');
      });

    it('when post has a already 9 images and add more 2 images than expected response', async () => {
      const feedPost2 = await feedPostsService.create(
        feedPostFactory.build(
          {
            images: [
              {
                image_path: '/feed/feed_sample1.jpg',
                description: 'this feed comment description 1',
              },
              {
                image_path: '/feed/feed_sample2.jpg',
                description: 'this feed comment description 2',
              },
              {
                image_path: '/feed/feed_sample3.jpg',
                description: null,
              },
              {
                image_path: '/feed/feed_sample4.jpg',
                description: 'this feed comment description 3',
              },
              {
                image_path: '/feed/feed_sample5.jpg',
                description: 'this feed comment description 4',
              },
              {
                image_path: '/feed/feed_sample6.jpg',
                description: 'this feed comment description 5',
              },
              {
                image_path: '/feed/feed_sample7.jpg',
                description: 'this feed comment description 6',
              },
              {
                image_path: '/feed/feed_sample8.jpg',
                description: 'this feed comment description 7',
              },
              {
                image_path: '/feed/feed_sample9.jpg',
                description: 'this feed comment description 8',
              },
            ],
            userId: activeUser._id,
          },
        ),
      );

      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost2._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1]);
        expect(response.body).toEqual({
          statusCode: 400,
          message: 'Cannot include more than 10 images on a post.',
        });
      }, [
        { extension: 'png' }, { extension: 'png' },
        { extension: 'png' }, { extension: 'png' },
        { extension: 'png' }, { extension: 'png' },
      ]);
      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('check message has a empty string or files or imagesToDelete is not exists', async () => {
      const feedPost3 = await feedPostsService.create(
        feedPostFactory.build(
          {
            images: [],
            userId: activeUser._id,
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost3._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', '');
      expect(response.body).toEqual({
        statusCode: 400,
        message: 'Posts must have some text or at least one image.',
      });
    });

    it('when add new hashtag on post than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost4._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', '"test user#ok #Slasher post #nothing12 #ok1?12 #!1good2"')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .field('imageDescriptions[0][description]', 'this is update post description 0');
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: '"test user#ok #Slasher post #nothing12 #ok1?12 #!1good2"',
          spoilers: false,
          userId: activeUser._id.toString(),
          hashtags: ['nothing12', 'ok', 'ok1', 'slasher'],
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is update post description 0',
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is test description',
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is test description',
            },
          ],
        });

        const post = await feedPostsService.findById(response.body._id, true);
        expect(post.hashtags).toEqual(['ok', 'slasher', 'nothing12', 'ok1']);

        const hashtags = await hashtagModel.find({ name: { $in: post.hashtags } });
        expect(hashtags[0].name).toBe('nothing12');
        expect(hashtags[1].name).toBe('ok');
        expect(hashtags[2].name).toBe('ok1');
        expect(hashtags[3].name).toBe('slasher');
      }, [{ extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('only allows a maximum of 10 hashtags', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'test user#ok #slasher #nothing #okay #best #not #go #run #fast #good #buy')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .field('imageDescriptions[0][description]', 'this is update post description 0');
        expect(response.body).toEqual({
          statusCode: 400,
          message: 'you can not add more than 10 hashtags on a post',
        });
      }, [{ extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('post has a 2 hashtags now update one old or one new hashtags than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost4._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'test user #Slasher post #funny')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .field('imageDescriptions[0][description]', 'this is update post description 0');
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'test user #Slasher post #funny',
          spoilers: false,
          userId: activeUser._id.toString(),
          hashtags: ['funny', 'slasher'],
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is update post description 0',
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is test description',
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is test description',
            },
          ],
        });
        const post = await feedPostsService.findById(response.body._id, true);
        expect(post.hashtags).toEqual(['slasher', 'funny']);

        const hashtags = await hashtagModel.find({ name: { $in: post.hashtags } });
        expect(hashtags[0].name).toBe('funny');
        expect(hashtags[1].name).toBe('slasher');
      }, [{ extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('post has a 2 hashtags now update two new hashtags than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost4._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'test user #flash #best')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .field('imageDescriptions[0][description]', 'this is update post description 0');
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'test user #flash #best',
          spoilers: false,
          userId: activeUser._id.toString(),
          hashtags: ['best', 'flash'],
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is update post description 0',
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is test description',
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is test description',
            },
          ],
        });
        const post = await feedPostsService.findById(response.body._id, true);
        expect(post.hashtags).toEqual(['flash', 'best']);

        const hashtags = await hashtagModel.find({ name: { $in: post.hashtags } });
        expect(hashtags[0].name).toBe('best');
        expect(hashtags[1].name).toBe('flash');

        const decrementTotalPostCount = await hashtagModel.find({ name: { $in: feedPost4.hashtags } });
        expect(decrementTotalPostCount[0].totalPost).toBe(0);
        expect(decrementTotalPostCount[1].totalPost).toBe(0);
      }, [{ extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when moviePostFields is exits but movieId is not exist in post than expected response', async () => {
      const feedPost6 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
            postType: PostType.MovieReview,
          },
        ),
      );
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost6._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'this new post')
          .field('moviePostFields[spoilers]', true)
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .field('imageDescriptions[0][description]', 'this is update post description 0')
          .field('imageDescriptions[1][description]', 'this is update post description 1');
        expect(response.body).toEqual({
          statusCode: 400,
          message: 'When submitting moviePostFields, movieId is required.',
        });
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when bookPostFields is exits but bookId is not exist in post than expected response', async () => {
      const feedPost6 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
            postType: PostType.BookReview,
          },
        ),
      );
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost6._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'this new post')
          .field('bookPostFields[spoilers]', true)
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .field('imageDescriptions[0][description]', 'this is update post description 0')
          .field('imageDescriptions[1][description]', 'this is update post description 1');
        expect(response.body).toEqual({
          statusCode: 400,
          message: 'When submitting bookPostFields, bookId is required.',
        });
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when moviePostFields is exits than expected response', async () => {
      const feedPost5 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
            movieId: movie._id,
            postType: PostType.MovieReview,
          },
        ),
      );
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost5._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'this new post')
          .field('moviePostFields[spoilers]', true)
          .field('moviePostFields[rating]', 3)
          .field('moviePostFields[goreFactorRating]', 4)
          .field('moviePostFields[worthWatching]', WorthWatchingStatus.Down)
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .field('imageDescriptions[0][description]', 'this is update post description 0')
          .field('imageDescriptions[1][description]', 'this is update post description 1');
        const post = await feedPostsService.findById(response.body._id, true);
        const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString());
        expect(post.spoilers).toBe(true);
        expect(movieUserStatus.rating).toBe(3);
        expect(movieUserStatus.goreFactorRating).toBe(4);
        expect(movieUserStatus.worthWatching).toBe(WorthWatchingStatus.Down);
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when bookPostFields is exits than expected response', async () => {
      const feedPost5 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
            bookId: book._id,
            postType: PostType.BookReview,
          },
        ),
      );
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost5._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'this new post')
          .field('bookPostFields[spoilers]', true)
          .field('bookPostFields[rating]', 3)
          .field('bookPostFields[goreFactorRating]', 4)
          .field('bookPostFields[worthReading]', WorthReadingStatus.Down)
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .field('imageDescriptions[0][description]', 'this is update post description 0')
          .field('imageDescriptions[1][description]', 'this is update post description 1');
        const post = await feedPostsService.findById(response.body._id, true);
        const bookUserStatus = await bookUserStatusService.findBookUserStatus(activeUser._id.toString(), book._id.toString());
        expect(post.spoilers).toBe(true);
        expect(bookUserStatus.rating).toBe(3);
        expect(bookUserStatus.goreFactorRating).toBe(4);
        expect(bookUserStatus.worthReading).toBe(WorthReadingStatus.Down);
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when WorthWatchingStatus is NoRating than expected response', async () => {
      const feedPost5 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
            movieId: movie._id,
            postType: PostType.MovieReview,
          },
        ),
      );
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost5._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'this new post')
          .field('moviePostFields[spoilers]', true)
          .field('moviePostFields[worthWatching]', WorthWatchingStatus.NoRating)
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .field('imageDescriptions[0][description]', 'this is update post description 0')
          .field('imageDescriptions[1][description]', 'this is update post description 1');
        const post = await feedPostsService.findById(response.body._id, true);
        const movieUserStatus = await movieUserStatusService.findMovieUserStatus(activeUser._id.toString(), movie._id.toString());
        expect(post.spoilers).toBe(true);
        expect(movieUserStatus.worthWatching).toBe(WorthWatchingStatus.NoRating);
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when moviePostFields is exits but postType is User than expected response', async () => {
      const feedPost9 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
            movieId: movie._id,
            postType: PostType.User,
          },
        ),
      );
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost9._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'this new post')
          .field('moviePostFields[spoilers]', true)
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .field('imageDescriptions[0][description]', 'this is update post description 0')
          .field('imageDescriptions[1][description]', 'this is update post description 1');
        expect(response.body).toEqual({
          statusCode: 400,
          message: 'When submitting moviePostFields, post type must be MovieReview.',
        });
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when bookPostFields is exits but postType is User than expected response', async () => {
      const feedPost9 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
            bookId: book._id,
            postType: PostType.User,
          },
        ),
      );
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost9._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'this new post')
          .field('bookPostFields[spoilers]', true)
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .field('imageDescriptions[0][description]', 'this is update post description 0')
          .field('imageDescriptions[1][description]', 'this is update post description 1');
        expect(response.body).toEqual({
          statusCode: 400,
          message: 'When submitting bookPostFields, post type must be BookReview.',
        });
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('check trim is working for message in update feed posts', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('message', '     this new post   ')
        .field('userId', activeUser._id.toString())
        .field('postType', PostType.MovieReview);
      expect(response.body).toEqual({
        _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
        message: 'this new post',
        spoilers: false,
        userId: activeUser._id.toString(),
        hashtags: [],
        images: [
          {
            image_path: 'http://localhost:4444/api/v1/local-storage/feed/feed_sample1.jpg',
            description: 'this is test description',
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          },
          {
            image_path: 'http://localhost:4444/api/v1/local-storage/feed/feed_sample1.jpg',
            description: 'this is test description',
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          },
        ],
      });
    });

    it('returns the expected response when the message only contains whitespace characters', async () => {
      const feedPost7 = await feedPostsService.create(
        feedPostFactory.build(
          {
            images: [],
            userId: activeUser._id,
            postType: PostType.User,
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost7._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('message', '     \n\n');
      expect(response.body).toEqual({
        statusCode: 400,
        message: 'Posts must have some text or at least one image.',
      });
    });

    it('when postType is movieReview and message is empty string than expected response', async () => {
      const feedPost8 = await feedPostsService.create(
        feedPostFactory.build(
          {
            userId: activeUser._id,
            postType: PostType.MovieReview,
          },
        ),
      );
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost8._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', '');
      expect(response.body).toEqual(
        { statusCode: 400, message: 'Review must have a some text' },
      );
    });

    it('when we add single 5(hashtags) and double 5(hashtags)', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'test user#ok #slasher #nothing #okay #best ##not ##go ##run ##fast ##good')
          .field('userId', activeUser._id.toString())
          .field('postType', PostType.User)
          .attach('files', tempPaths[0])
          .field('imageDescriptions[0][description]', 'this is update post description 0');
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'test user#ok #slasher #nothing #okay #best ##not ##go ##run ##fast ##good',
          spoilers: false,
          userId: activeUser._id.toString(),
          hashtags: ['best', 'nothing', 'ok', 'okay', 'slasher'],
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is update post description 0',
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is test description',
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is test description',
            },
          ],
        });
      }, [{ extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when files length is not equal imageDescriptions length than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hello test user')
          .attach('files', tempPaths[0])
          .attach('files', tempPaths[1])
          .field('imageDescriptions[1][description]', 'this is create feed comments description 2');
        expect(response.body).toEqual({
          statusCode: 400,
          message: 'files length and imagesDescriptions length should be same',
        });
      }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpg' }, { extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when imageDescriptions is empty string than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', sampleFeedPostObject.message)
          .attach('files', tempPaths[0])
          .field('imageDescriptions[0][description]', '');
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'hello all test user upload your feed post',
          userId: activeUser._id.toString(),
          hashtags: [],
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: null,
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is test description',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              description: 'this is test description',
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
          ],
          spoilers: false,
        });
      }, [{ extension: 'png' }]);
    });

    it('when we add all types of hashtags including # and ## than it gives the expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'hashtag testing post 1 #friend#friend1#friend2 ##done ##slasher #123horror @ghost #horror@12 ##horror12!12')
          .field('userId', activeUser._id.toString())
          .field('postType', PostType.User)
          .attach('files', tempPaths[0])
          .field('imageDescriptions[0][description]', 'this is update post description 0');
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'hashtag testing post 1 #friend#friend1#friend2 ##done ##slasher #123horror @ghost #horror@12 ##horror12!12',
          spoilers: false,
          userId: activeUser._id.toString(),
          hashtags: ['123horror', 'friend', 'friend1', 'friend2', 'horror'],
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is update post description 0',
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is test description',
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is test description',
            },
          ],
        });
      }, [{ extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });

    it('when message start with hashtag than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', '#test user#ok #slasher #nothing #okay')
          .field('userId', activeUser._id.toString())
          .field('postType', PostType.User)
          .attach('files', tempPaths[0])
          .field('imageDescriptions[0][description]', 'this is update post description 0');
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: '#test user#ok #slasher #nothing #okay',
          spoilers: false,
          userId: activeUser._id.toString(),
          hashtags: ['nothing', 'ok', 'okay', 'slasher', 'test'],
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is update post description 0',
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is test description',
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              description: 'this is test description',
            },
          ],
        });
      }, [{ extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });
  });

  describe('notifications', () => {
    it('when notification is create for updateFeedPost than check newNotificationCount is increment in user', async () => {
      const otherUser1 = await usersService.create(userFactory.build({ userName: 'Denial' }));
      const otherUser2 = await usersService.create(userFactory.build({ userName: 'Divine' }));
      await userSettingsService.create(
        userSettingFactory.build(
          {
            userId: otherUser2._id,
          },
        ),
      );
      const otherUser3 = await usersService.create(userFactory.build({ userName: 'Den' }));
      await userSettingsService.create(
        userSettingFactory.build(
          {
            userId: otherUser3._id,
          },
        ),
      );
      const post = await feedPostsService.create(feedPostFactory.build(
        {
          userId: activeUser._id,
          message: `##LINK_ID##${otherUser1._id.toString()}@Denial##LINK_END## other user 1`,
        },
      ));
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${post._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field(
          'message',
          `##LINK_ID##${otherUser2._id.toString()}@Denial##LINK_END## other user 2`
          + `##LINK_ID##${otherUser3._id.toString()}@Den##LINK_END## other user 3`,
        );
      expect(response.status).toEqual(HttpStatus.OK);

      const otherUser3NewNotificationCount = await usersService.findById(otherUser3.id, true);
      const otherUser2NewNotificationCount = await usersService.findById(otherUser2.id, true);
      expect(otherUser3NewNotificationCount.newNotificationCount).toBe(1);
      expect(otherUser2NewNotificationCount.newNotificationCount).toBe(1);
    });
  });

  describe('Validation', () => {
    it('id must be a mongodb id', async () => {
      const feedPostId = 'not-a-mongo-id';
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPostId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', sampleFeedPostObject.message);
      expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
      expect(response.body.message).toContain(
        'id must be a mongodb id',
      );
    });

    it('check message length validation', async () => {
      const message = new Array(20_002).join('z');
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', message);
      expect(response.body.message).toContain('message cannot be longer than 20,000 characters');
    });

    it('spoilers should not be empty', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('userId', activeUser._id.toString())
        .field('postType', 3)
        .field('moviePostFields[rating]', 2);
      expect(response.body.message).toContain('spoilers should not be empty');
    });

    it('rating must not be greater than 5', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('userId', activeUser._id.toString())
        .field('postType', 3)
        .field('moviePostFields[spoilers]', true)
        .field('moviePostFields[rating]', 6);
      expect(response.body.message).toContain('rating must be less than 5');
    });

    it('rating must not be less than 1', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('userId', activeUser._id.toString())
        .field('postType', 3)
        .field('moviePostFields[spoilers]', true)
        .field('moviePostFields[rating]', 0);
      expect(response.body.message).toContain('rating must be greater than 1');
    });

    it('goreFactorRating must not be greater than 5', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('userId', activeUser._id.toString())
        .field('postType', 3)
        .field('moviePostFields[spoilers]', true)
        .field('moviePostFields[goreFactorRating]', 6);
      expect(response.body.message).toContain('goreFactorRating must be less than 5');
    });

    it('goreFactorRating must not be less than 1', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('userId', activeUser._id.toString())
        .field('postType', 3)
        .field('moviePostFields[spoilers]', true)
        .field('moviePostFields[goreFactorRating]', 0);
      expect(response.body.message).toContain('goreFactorRating must be greater than 1');
    });

    it('worthWatching must be one of the following values: 1, 2', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('userId', activeUser._id.toString())
        .field('postType', 3)
        .field('moviePostFields[spoilers]', true)
        .field('moviePostFields[worthWatching]', 6);
      expect(response.body.message).toContain('worthWatching must be one of the following values: 0, 1, 2');
    });

    it('worthReading must be one of the following values: 1, 2', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/feed-posts')
        .auth(activeUserAuthToken, { type: 'bearer' })
        .field('userId', activeUser._id.toString())
        .field('postType', 4)
        .field('bookPostFields[spoilers]', true)
        .field('bookPostFields[worthReading]', 6);
      expect(response.body.message).toContain('worthReading must be one of the following values: 1, 2');
    });
    });

    it('check description length validation', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'update feed post message')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0])
          .field('imageDescriptions[0][description]', new Array(252).join('z'))
          .expect(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('description cannot be longer than 250 characters');
      }, [{ extension: 'png' }, { extension: 'jpg' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });
  });
