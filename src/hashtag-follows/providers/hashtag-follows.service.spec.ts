import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { userFactory } from '../../../test/factories/user.factory';
import { UsersService } from '../../users/providers/users.service';
import { User } from '../../schemas/user/user.schema';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { HashtagFollowsService } from './hashtag-follows.service';
import { HashtagService } from '../../hashtag/providers/hashtag.service';

describe('HashtagFollowsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let hashtagFollowsService: HashtagFollowsService;
  let hashtagService: HashtagService;
  let activeUser: User;
  let user0: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    hashtagService = moduleRef.get<HashtagService>(HashtagService);
    hashtagFollowsService = moduleRef.get<HashtagFollowsService>(HashtagFollowsService);
    usersService = moduleRef.get<UsersService>(UsersService);

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let hashtag;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
    activeUser = await usersService.create(userFactory.build());
    hashtag = await hashtagService.createOrUpdateHashtags(['ok']);
  });

  it('should be defined', () => {
    expect(hashtagFollowsService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a hashtag follows', async () => {
      const hashtagFollows = await hashtagFollowsService.create({
        userId: activeUser._id,
        hashTagId: hashtag[0]._id,
      });
      expect(
        await hashtagFollowsService.findById(hashtagFollows.id),
      ).toBeTruthy();
    });
  });

  describe('#findById', () => {
    let hashtagFollows;
    beforeEach(async () => {
      user0 = await usersService.create(userFactory.build());
      hashtagFollows = await hashtagFollowsService.create({
        userId: user0._id,
        hashTagId: hashtag[0]._id,
      });
    });

    it('finds the expected hashtag follow details', async () => {
      const hashtagFollowDetails = await hashtagFollowsService.findById(hashtagFollows.id);
      expect(hashtagFollowDetails.userId).toEqual(hashtagFollows.userId);
      expect(hashtagFollowDetails.hashTagId).toEqual(hashtagFollows.hashTagId);
    });
  });

  describe('#findOneAndUpdateHashtagFollow', () => {
    let hashtagFollows;
    beforeEach(async () => {
      user0 = await usersService.create(userFactory.build());
      hashtagFollows = await hashtagFollowsService.create({
        userId: user0._id,
        hashTagId: hashtag[0]._id,
      });
    });

    it('insert or update hashtag follow details', async () => {
      const insertOrUpdateHashtagFollow = await hashtagFollowsService.findOneAndUpdateHashtagFollow(
        hashtagFollows.userId,
        hashtagFollows.hashTagId,
        true,
      );
      expect(insertOrUpdateHashtagFollow.userId).toEqual(hashtagFollows.userId);
      expect(insertOrUpdateHashtagFollow.hashTagId).toEqual(hashtagFollows.hashTagId);
    });
  });

  describe('#deleteById', () => {
    let hashtagFollows;
    beforeEach(async () => {
      user0 = await usersService.create(userFactory.build());
      hashtagFollows = await hashtagFollowsService.create({
        userId: user0._id,
        hashTagId: hashtag[0]._id,
      });
    });
    it('delete hashtag follow details', async () => {
      await hashtagFollowsService.deleteById(hashtagFollows.id);
      const deleteHashtagFollow = await hashtagFollowsService.findById(hashtagFollows.id);
      expect(deleteHashtagFollow).toBeNull();
    });
  });

  describe('#findByUserAndHashtag', () => {
    it('finds the expected hashtag follow details', async () => {
      const hashtagFollows = await hashtagFollowsService.create(
        {
          userId: activeUser._id,
          hashTagId: hashtag[0]._id,
        },
      );
      const hashtagFollowsData = await hashtagFollowsService
        .findByUserAndHashtag(
          hashtagFollows.userId.toString(),
          hashtagFollows.hashTagId.toString(),
        );
      expect(hashtagFollowsData.hashTagId).toEqual(hashtagFollows.hashTagId);
      expect(hashtagFollowsData.userId).toEqual(hashtagFollows.userId);
    });
  });

  describe('#findAllByUserId', () => {
    beforeEach(async () => {
      user0 = await usersService.create(userFactory.build());
      await hashtagFollowsService.create({
        userId: user0._id,
        hashTagId: hashtag[0]._id,
      });
      await hashtagFollowsService.create({
        userId: user0._id,
        hashTagId: hashtag[0]._id,
      });
      await hashtagFollowsService.create({
        userId: activeUser._id,
        hashTagId: hashtag[0]._id,
      });
    });

    it('finds the expected hashtag follow details by userId', async () => {
      const hashtagFollowDetails = await hashtagFollowsService.findAllByUserId(user0._id.toString());
      expect(hashtagFollowDetails.map((hashtagFollow) => hashtagFollow.userId)).toEqual([user0._id, user0._id]);
    });
  });

  describe('#insertManyHashtagFollow', () => {
    it('insert many hashtags', async () => {
      const hashtag0 = await hashtagService.createOrUpdateHashtags(['horror']);
      const hashtag1 = await hashtagService.createOrUpdateHashtags(['scary']);
      const hashtag2 = await hashtagService.createOrUpdateHashtags(['slasher']);
      const hashtags = await hashtagFollowsService.insertManyHashtagFollow(
        activeUser._id.toString(),
        [hashtag0[0].id, hashtag1[0].id, hashtag2[0].id],
      );
      expect(hashtags[0].hashTagId).toEqual(hashtag0[0]._id);
      expect(hashtags[1].hashTagId).toEqual(hashtag1[0]._id);
      expect(hashtags[2].hashTagId).toEqual(hashtag2[0]._id);
    });
  });
});
