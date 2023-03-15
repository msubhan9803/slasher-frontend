import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { HashtagDocument, Hashtag } from '../../schemas/hastag/hashtag.schema';
import { HashtagService } from './hashtag.service';
import { HashtagActiveStatus } from '../../schemas/hastag/hashtag.enums';

describe('HashtagService', () => {
  let app: INestApplication;
  let connection: Connection;
  let hashtagService: HashtagService;
  let hashtagModel: Model<HashtagDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    hashtagService = moduleRef.get<HashtagService>(HashtagService);
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
      expect(hashtags[0].totalPost).toBe(0);
      expect(hashtags[1].totalPost).toBe(1);
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
});
