import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
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

describe('Update Feed Post (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let user1: User;
  let configService: ConfigService;
  let feedPostsService: FeedPostsService;
  let feedPost: FeedPostDocument;

  const sampleFeedPostObject = {
    message: 'hello all test user upload your feed post',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
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
  });

  describe('PATCH /api/v1/feed-posts/:id', () => {
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
        .auth(activeUserAuthToken, { type: 'bearer' });
      expect(response.status).toEqual(HttpStatus.FORBIDDEN);
      expect(response.body.message).toBe('You can only edit a post that you created.');
    });

    it('when feed post is not found, returns the expected feed post response', async () => {
      const feedPostDetails = '634fc8d86a5897b88a2d9753';
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/feed-posts/${feedPostDetails}`)
        .auth(activeUserAuthToken, { type: 'bearer' });
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
        expect(response.body.message).toBe('Only allow a maximum of 10 images');
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
