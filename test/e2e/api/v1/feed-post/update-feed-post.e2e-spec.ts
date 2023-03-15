/* eslint-disable max-lines */
import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { EventEmitter } from 'stream';
import { readdirSync } from 'fs';
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
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    hashtagService = moduleRef.get<HashtagService>(HashtagService);
    hashtagModel = moduleRef.get<Model<HashtagDocument>>(getModelToken(Hashtag.name));
    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let feedPost4;
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
        images: [
          {
            image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          },
          {
            image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          },
        ],
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
          .attach('files', tempPaths[1]);
        const feedPostDetails = await feedPostsService.findById(response.body._id, true);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'hello test user',
          userId: activeUser._id.toString(),
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
          ],
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
          .attach('files', tempPaths[1]);
        const feedPostDetails = await feedPostsService.findById(response.body._id, true);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'hello test user',
          userId: activeUser._id.toString(),
          images: [
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
          ],
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
        images: [
          {
            image_path: expect.stringMatching(/\/feed\/feed_.+\.png|jpe?g/),
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          },
        ],
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
        expect(response.body.message).toBe('Posts must have a message or at least one image. No message or image received.');
      });

    it('when post has a already 9 images and add more 2 images than expected response', async () => {
      const feedPost2 = await feedPostsService.create(
        feedPostFactory.build(
          {
            images: [
              {
                image_path: '/feed/feed_sample1.jpg',
              },
              {
                image_path: '/feed/feed_sample2.jpg',
              },
              {
                image_path: '/feed/feed_sample3.jpg',
              },
              {
                image_path: '/feed/feed_sample4.jpg',
              },
              {
                image_path: '/feed/feed_sample5.jpg',
              },
              {
                image_path: '/feed/feed_sample6.jpg',
              },
              {
                image_path: '/feed/feed_sample7.jpg',
              },
              {
                image_path: '/feed/feed_sample8.jpg',
              },
              {
                image_path: '/feed/feed_sample9.jpg',
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

    it('check message has a black string or files or imagesToDelete is not exists', async () => {
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
        message: 'Posts must have a message or at least one image. No message or image received.',
      });
    });

    it('when add new hashtag on post than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost4._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'test user#ok #Slasher post #nothing #ok #good')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0]);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'test user#ok #Slasher post #nothing #ok #good',
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
          ],
        });

        const post = await feedPostsService.findById(response.body._id, true);
        expect(post.hashtags).toEqual(['ok', 'slasher', 'nothing', 'good']);

        const hashtags = await hashtagModel.find({ name: { $in: post.hashtags } });
        expect(hashtags[0].name).toEqual(post.hashtags[0]);
        expect(hashtags[1].name).toEqual(post.hashtags[1]);
        expect(hashtags[2].name).toEqual(post.hashtags[2]);
        expect(hashtags[3].name).toEqual(post.hashtags[3]);
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

    it('post has a 2 hashtags now update one old or one new hashtags than expected response', async () => {
      await createTempFiles(async (tempPaths) => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/feed-posts/${feedPost4._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .set('Content-Type', 'multipart/form-data')
          .field('message', 'test user #Slasher post #funny')
          .field('userId', activeUser._id.toString())
          .attach('files', tempPaths[0]);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'test user #Slasher post #funny',
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
          ],
        });
        const post = await feedPostsService.findById(response.body._id, true);
        expect(post.hashtags).toEqual(['slasher', 'funny']);

        const hashtags = await hashtagModel.find({ name: { $in: post.hashtags } });
        expect(hashtags[0].name).toEqual(post.hashtags[0]);
        expect(hashtags[1].name).toEqual(post.hashtags[1]);
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
          .attach('files', tempPaths[0]);
        expect(response.body).toEqual({
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          message: 'test user #flash #best',
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
          ],
        });
        const post = await feedPostsService.findById(response.body._id, true);
        expect(post.hashtags).toEqual(['flash', 'best']);

        const hashtags = await hashtagModel.find({ name: { $in: post.hashtags } });
        expect(hashtags[0].name).toEqual(post.hashtags[0]);
        expect(hashtags[1].name).toEqual(post.hashtags[1]);

        const decrementTotalPostCount = await hashtagModel.find({ name: { $in: feedPost4.hashtags } });
        expect(decrementTotalPostCount[0].totalPost).toBe(0);
        expect(decrementTotalPostCount[1].totalPost).toBe(0);
      }, [{ extension: 'png' }]);

      // There should be no files in `UPLOAD_DIR` (other than one .keep file)
      const allFilesNames = readdirSync(configService.get<string>('UPLOAD_DIR'));
      expect(allFilesNames).toEqual(['.keep']);
    });
  });

  describe('Validation', () => {
    it('check message length validation', async () => {
      const message = new Array(20_002).join('z');
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPost._id}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .set('Content-Type', 'multipart/form-data')
        .field('message', message);
      expect(response.body.message).toContain('message cannot be longer than 20,000 characters');
    });
  });
});
