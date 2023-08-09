import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { DateTime } from 'luxon';
import { AppModule } from '../../app.module';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { HashtagDocument, Hashtag } from '../../schemas/hastag/hashtag.schema';
import { HashtagService } from './hashtag.service';
import { HashtagActiveStatus } from '../../schemas/hastag/hashtag.enums';
import { FeedPostsService } from '../../feed-posts/providers/feed-posts.service';
import { feedPostFactory } from '../../../test/factories/feed-post.factory';
import { UsersService } from '../../users/providers/users.service';
import { userFactory } from '../../../test/factories/user.factory';
import { toUtcStartOfDay } from '../../utils/date-utils';

describe('HashtagService', () => {
  let app: INestApplication;
  let connection: Connection;
  let hashtagService: HashtagService;
  let hashtagModel: Model<HashtagDocument>;
  let feedPostsService: FeedPostsService;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    hashtagService = moduleRef.get<HashtagService>(HashtagService);
    hashtagModel = moduleRef.get<Model<HashtagDocument>>(getModelToken(Hashtag.name));
    feedPostsService = moduleRef.get<FeedPostsService>(FeedPostsService);
    usersService = moduleRef.get<UsersService>(UsersService);

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let activeUser;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();
    activeUser = await usersService.create(userFactory.build());
  });

  it('should be defined', () => {
    expect(hashtagService).toBeDefined();
  });

  describe('#createOrUpdateHashtags', () => {
    it('create or update `name` in a hashtag document', async () => {
      const name = ['ok', 'slasher', 'nothing'];
      const hashtags = await hashtagService.createOrUpdateHashtags(name);
      expect(hashtags[0].name).toEqual(name[0]);
      expect(hashtags[1].name).toEqual(name[1]);
      expect(hashtags[2].name).toEqual(name[2]);
    });
  });

  describe('#decrementTotalPost', () => {
    it('decrement total post in a hashtag document', async () => {
      const name = ['ok', 'slasher', 'nothing'];
      await hashtagService.createOrUpdateHashtags(name);
      const name1 = ['ok'];
      await hashtagService.decrementTotalPost(name1);
      const hashtags = await hashtagModel.find({ name: { $in: name } });
      expect(hashtags[0].totalPost).toBe(1);
      expect(hashtags[1].totalPost).toBe(0);
      expect(hashtags[2].totalPost).toBe(1);
    });
  });

  describe('#suggestHashtagName', () => {
    beforeEach(async () => {
      await hashtagModel.create({
        name: 'good',
      });
      await hashtagModel.create({
        name: 'goodidea',
      });
      await hashtagModel.create({
        name: 'goodbook',
      });
      await hashtagModel.create({
        name: 'goodnight',
      });
      await hashtagModel.create({
        name: 'goodmorning',
        status: HashtagActiveStatus.Deactivated,
        deleted: true,
      });
      await hashtagModel.create({
        name: 'goodbyy',
        status: HashtagActiveStatus.Deactivated,
        deleted: true,
      });
    });

    it('when query exists, returns expected response, with orders sorted alphabetically by name', async () => {
      const query = 'goo';
      const limit = 10;
      const suggestHashtagNames = await hashtagService.suggestHashtagName(query, limit, true);
      expect(suggestHashtagNames).toHaveLength(4);
      expect(suggestHashtagNames.map((suggestHashtagName) => suggestHashtagName.name)).toEqual(
        ['good', 'goodbook', 'goodidea', 'goodnight'],
      );
    });

    it('when query is exists and limited is applied, returns expected response', async () => {
      const query = 'goo';
      const limit = 1;
      const suggestUserNames = await hashtagService.suggestHashtagName(query, limit, true);
      expect(suggestUserNames).toHaveLength(1);
    });

    it('when query is exists and limited and offset are applied, returns expected response', async () => {
      const query = 'goo';
      const limit = 5;
      const offset = 1;
      const suggestUserNames = await hashtagService.suggestHashtagName(query, limit, true, offset);
      expect(suggestUserNames).toHaveLength(3);
    });

    it('when query is wrong than expected response', async () => {
      const query = 'wq';
      const limit = 5;
      const suggestUserNames = await hashtagService.suggestHashtagName(query, limit, true);
      expect(suggestUserNames).toEqual([]);
    });

    it('when activeOnly is false then it gives expected response', async () => {
      const query = 'goo';
      const limit = 10;
      const suggestUserNames = await hashtagService.suggestHashtagName(query, limit, false);
      expect(suggestUserNames).toHaveLength(6);
    });
  });

  describe('#findAllHashtags', () => {
    beforeEach(async () => {
      await hashtagModel.create({
        name: 'frightfulness',
      });
      await hashtagModel.create({
        name: 'horridness',
      });
      await hashtagModel.create({
        name: 'grisliness',
      });
      await hashtagModel.create({
        name: 'depravity',
      });
      await hashtagModel.create({
        name: 'scariness',
      });
      await hashtagModel.create({
        name: 'scary',
        status: HashtagActiveStatus.Deactivated,
        deleted: true,
      });
    });

    it('finds the expected hashtah names', async () => {
      const query = ['depravity', 'scariness'];
      const limit = 10;
      const hashtags = await hashtagService.findAllHashtags(query, limit);
      expect(hashtags).toHaveLength(3);
      expect(hashtags.map((suggestHashtagName) => suggestHashtagName.name)).toEqual(
        ['frightfulness', 'horridness', 'grisliness'],
      );
    });
  });

  describe('#findAllHashTagName', () => {
    beforeEach(async () => {
      await hashtagModel.create({
        name: 'depravity',
      });
      await hashtagModel.create({
        name: 'scariness',
      });
      await hashtagModel.create({
        name: 'scary',
        status: HashtagActiveStatus.Deactivated,
        deleted: true,
      });
    });

    it('find all expected hashtag names', async () => {
      const query = ['depravity', 'scariness'];
      const hashtags = await hashtagService.findAllHashTagName(query);
      expect(hashtags).toHaveLength(2);
      expect(hashtags.map((suggestHashtagName) => suggestHashtagName.name)).toEqual(
        ['depravity', 'scariness'],
      );
    });
  });

  describe('#findAllHashtagById', () => {
    let hashtag1;
    let hashtag2;
    let hashtag3;
    let hashtag4;
    let hashtag5;
    beforeEach(async () => {
      hashtag1 = await hashtagModel.create({
        name: 'horror',
      });
      hashtag2 = await hashtagModel.create({
        name: 'horrorname',
      });
      hashtag3 = await hashtagModel.create({
        name: 'horrormovie',
      });
      hashtag4 = await hashtagModel.create({
        name: 'scary',
      });
      hashtag5 = await hashtagModel.create({
        name: 'slasher',
      });
    });

    it('find all expected hashtags using hashIds', async () => {
      const hashtagArray = [hashtag1._id, hashtag2._id, hashtag3._id, hashtag4._id, hashtag5._id];
      const limit = 3;
      const offset = 1;
      const query = 'hor';
      const hashtags = await hashtagService.findAllHashtagById(hashtagArray, limit, query, offset);
      expect(hashtags).toHaveLength(2);
    });

    it('find all expected hashtags when offset is not existing', async () => {
      const hashtagArray = [hashtag1._id, hashtag2._id, hashtag3._id, hashtag4._id, hashtag5._id];
      const limit = 2;
      const query = 'ho';
      const hashtags = await hashtagService.findAllHashtagById(hashtagArray, limit, query);
      expect(hashtags).toHaveLength(2);
    });

    it('find all expected hashtags when query is not existing', async () => {
      const hashtagArray = [hashtag1._id, hashtag2._id, hashtag3._id, hashtag4._id, hashtag5._id];
      const limit = 3;
      const offset = 1;
      const hashtags = await hashtagService.findAllHashtagById(hashtagArray, limit, null, offset);
      expect(hashtags).toHaveLength(3);
    });
  });

  describe('#hashtagOnboardingSuggestions', () => {
    beforeEach(async () => {
      const names = [
        'horror1', 'horror2', 'horror3', 'horror4', 'horror5',
        'horror6', 'horror7', 'horror8', 'horror9', 'horror10',
        'horror11', 'horror12', 'horror13', 'horror14', 'horror15',
        'horror16', 'horror17', 'horror18', 'horror19', 'horror20',
      ];
      for (let i = 0; i < names.length; i += 1) {
        await hashtagModel.create({
          name: names[i],
        });
      }

      await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser._id,
          message: 'slasher post#horror1 #horror2 #horror3 #horror4 #horror5 #horror6',
          createdAt: DateTime.now().minus({ days: 5 }).toJSDate(),
          updatedAt: DateTime.now().minus({ days: 5 }).toJSDate(),
          lastUpdateAt: DateTime.now().minus({ days: 5 }).toJSDate(),
          hashtags: [
            'horror1', 'horror2', 'horror3',
            'horror4', 'horror5', 'horror6',
          ],
        }),
      );
    });

    it('when hashtags plus hashtags24Hours not get 16 hashtags than finds db hashtags', async () => {
      const hashtags = await hashtagService.hashtagOnboardingSuggestions();
      expect(hashtags).toEqual([
        'horror1', 'horror2', 'horror3', 'horror4', 'horror5',
        'horror6', 'horror7', 'horror8', 'horror9', 'horror10',
        'horror11', 'horror12', 'horror13', 'horror14', 'horror15',
        'horror16',
      ]);
    });

    it('when hashtags has a common(fouteenDaysAgo + oneDayAgo = 14) and add 2 removedItems hashtags than expected response', async () => {
      await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser._id,
          message: 'post #horror7 #horror8 #horror9'
            + '#horror10 #horror11 #horror12 #horror13 #horror14 #horror15 #horror16'
            + '#horror17 #horror18 #horror19 #horror20',
          createdAt: DateTime.now().minus({ days: 1 }).toJSDate(),
          updatedAt: DateTime.now().minus({ days: 1 }).toJSDate(),
          lastUpdateAt: DateTime.now().minus({ days: 1 }).toJSDate(),
          hashtags: [
            'horror7', 'horror8', 'horror9', 'horror10',
            'horror11', 'horror12', 'horror13', 'horror14', 'horror15',
            'horror16', 'horror17', 'horror18', 'horror19', 'horror20',
          ],
        }),
      );
      const hashtags = await hashtagService.hashtagOnboardingSuggestions();
      expect(hashtags).toEqual([
        'horror7', 'horror8',
        'horror9', 'horror10',
        'horror11', 'horror12',
        'horror13', 'horror14',
        'horror15', 'horror16',
        'horror17', 'horror18',
        'horror19', 'horror20',
        'horror1', 'horror2',
      ]);
    });

    it('when hashtags has a common(fouteenDaysAgo + oneDayAgo = 16) hashtags than expected response', async () => {
      await feedPostsService.create(
        feedPostFactory.build({
          userId: activeUser._id,
          message: 'post #horror7 #horror8 #horror9'
            + '#horror10 #horror11 #horror12 #horror13 #horror14 #horror15 #horror16'
            + '#horror17 #horror18 #horror19 #horror20 #horror21 #horror22',
          createdAt: toUtcStartOfDay(DateTime.now().minus({ days: 1 }).toJSDate()),
          updatedAt: toUtcStartOfDay(DateTime.now().minus({ days: 1 }).toJSDate()),
          lastUpdateAt: toUtcStartOfDay(DateTime.now().minus({ days: 1 }).toJSDate()),
          hashtags: [
            'horror7', 'horror8', 'horror9', 'horror10',
            'horror11', 'horror12', 'horror13', 'horror14',
            'horror15', 'horror16', 'horror17', 'horror18',
            'horror19', 'horror20', 'horror21', 'horror22',
          ],
        }),
      );
      const hashtags = await hashtagService.hashtagOnboardingSuggestions();
      expect(hashtags).toEqual([
        'horror7', 'horror8',
        'horror9', 'horror10',
        'horror11', 'horror12',
        'horror13', 'horror14',
        'horror15', 'horror16',
        'horror17', 'horror18',
        'horror19', 'horror20',
        'horror21', 'horror22',
      ]);
    });
  });
});
