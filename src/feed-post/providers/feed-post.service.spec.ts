import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { FeedPostsService } from './feed-post.service';
import { userFactory } from '../../../test/factories/user.factory';
import { UsersService } from '../../users/providers/users.service';
import { feedPostFactory } from '../../../test/factories/feed-post.factory';
import { User } from '../../schemas/user/user.schema';

describe('FeedPostsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let feedPostsService: FeedPostsService;
  let usersService: UsersService;
  let activeUser: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    usersService = moduleRef.get<UsersService>(UsersService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();
    activeUser = await usersService.create(userFactory.build());
  });

  it('should be defined', () => {
    expect(feedPostsService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a feed post', async () => {
      const feedPostData = feedPostFactory.build({
        userId: activeUser._id,
      });
      const feedPost = await feedPostsService.create(feedPostData);
      expect(await feedPostsService.findById(feedPost._id)).toBeTruthy();
    });
  });

  describe('#findAllByUser', () => {
    beforeEach(async () => {
      for (let i = 0; i < 3; i += 1) {
        await feedPostsService.create(
          feedPostFactory.build({
            userId: activeUser._id,
          }),
        );
      }
    });
    it('finds the expected set of feed post', async () => {
      const feedPost = await feedPostsService.findAllByUser((activeUser._id).toString(), 3);
      expect(feedPost).toHaveLength(3);
    });

    it('when earlierThanPostId is false', async () => {
      const feedPost = await feedPostsService.findAllByUser((activeUser._id).toString(), 3, false);
      expect(feedPost).toHaveLength(3);
    });

    it('when earlierThanPostId is true', async () => {
      const feedPost = await feedPostsService.findAllByUser((activeUser._id).toString(), 3, true);
      expect(feedPost).toHaveLength(3);
    });
  });

  describe('#update', () => {
    let feedPost;
    beforeEach(async () => {
      feedPost = await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser._id,
        }),
      );
    });
    it('finds the expected feed post and update the details', async () => {
      const feedPostData = {
        message: 'Test message',
        images: [
          {
            image_path: 'https://picsum.photos/id/237/200/300',
          },
          {
            image_path: 'https://picsum.photos/seed/picsum/200/300',
          },
        ],
      };
      const updatedFindPost = await feedPostsService.update(feedPost._id, feedPostData);
      const reloadedFindPost = await feedPostsService.findById(updatedFindPost._id);
      expect(reloadedFindPost.message).toEqual(updatedFindPost.message);
      expect(reloadedFindPost.images).toEqual(updatedFindPost.images);
    });
  });
});
