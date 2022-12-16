import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { userFactory } from '../../../test/factories/user.factory';
import { rssFeedProviderFactory } from '../../../test/factories/rss-feed-providers.factory';
import { RssFeedProviderFollowsService } from './rss-feed-provider-follows.service';
import { UsersService } from '../../users/providers/users.service';
import { RssFeedProvidersService } from '../../rss-feed-providers/providers/rss-feed-providers.service';
import { User } from '../../schemas/user/user.schema';
import { RssFeedProvider } from '../../schemas/rssFeedProvider/rssFeedProvider.schema';
import { RssFeedProviderFollowDocument } from '../../schemas/rssFeedProviderFollow/rssFeedProviderFollow.schema';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';

describe('RssFeedProviderFollowsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let rssFeedProviderFollowsService: RssFeedProviderFollowsService;
  let usersService: UsersService;
  let rssFeedProvidersService: RssFeedProvidersService;
  let activeUser: User;
  let rssFeedProviderData: RssFeedProvider;
  let rssFeedProviderData2: RssFeedProvider;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    rssFeedProviderFollowsService = moduleRef.get<RssFeedProviderFollowsService>(RssFeedProviderFollowsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
    activeUser = await usersService.create(userFactory.build());
    rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
    rssFeedProviderData2 = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
  });

  it('should be defined', () => {
    expect(rssFeedProviderFollowsService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a rss feed provider follows', async () => {
      const rssFeedProviderFollows = await rssFeedProviderFollowsService.create({
        userId: activeUser._id,
        rssfeedProviderId: rssFeedProviderData._id,
      });
      expect(await rssFeedProviderFollowsService.findById(rssFeedProviderFollows._id)).toBeTruthy();
    });
  });

  describe('#findById', () => {
    let rssFeedProviderFollowData: RssFeedProviderFollowDocument;
    beforeEach(async () => {
      rssFeedProviderFollowData = await rssFeedProviderFollowsService.create(
        {
          userId: activeUser._id,
          rssfeedProviderId: rssFeedProviderData._id,
        },
      );
    });

    it('finds the expected rss feed provider follow details', async () => {
      const rssFeedProviderFollowDetails = await rssFeedProviderFollowsService.findById(rssFeedProviderFollowData._id);
      expect(rssFeedProviderFollowDetails.rssfeedProviderId).toEqual(rssFeedProviderFollowData.rssfeedProviderId);
      expect(rssFeedProviderFollowDetails.userId).toEqual(rssFeedProviderFollowData.userId);
    });
  });

  describe('#update', () => {
    let rssFeedProviderFollowData: RssFeedProviderFollowDocument;
    beforeEach(async () => {
      rssFeedProviderFollowData = await rssFeedProviderFollowsService.create(
        {
          userId: activeUser._id,
          rssfeedProviderId: rssFeedProviderData._id,
        },
      );
    });
    it('finds the expected rss feed provider follow and update the details', async () => {
      const rssFeedProviderFollowJson = {
        rssfeedProviderId: rssFeedProviderData2._id,
      };
      const updatedRssFeedProviderFollow = await rssFeedProviderFollowsService
        .update(rssFeedProviderFollowData._id, rssFeedProviderFollowJson);
      const reloadedRssFeedProviderFollow = await rssFeedProviderFollowsService.findById(updatedRssFeedProviderFollow._id.toString());
      expect(reloadedRssFeedProviderFollow.rssfeedProviderId).toEqual(updatedRssFeedProviderFollow.rssfeedProviderId);
    });
  });

  describe('#findAllByUserId', () => {
    beforeEach(async () => {
      for (let index = 0; index < 5; index += 1) {
        await rssFeedProviderFollowsService.create(
          {
            userId: activeUser._id,
            rssfeedProviderId: rssFeedProviderData._id,
          },
        );
      }
    });
    it('finds the expected rss feed provider follow details', async () => {
      const rssFeedProvidersFollowsList = await rssFeedProviderFollowsService.findAllByUserId(activeUser._id.toString());
      for (const rssFeedProvidersFollow of rssFeedProvidersFollowsList) {
        expect(rssFeedProvidersFollow.userId).toEqual(activeUser._id);
      }
      expect(rssFeedProvidersFollowsList).toHaveLength(5);
    });
  });

  describe('#findByUserAndRssFeedProvider', () => {
    it('finds the expected rss feed provider follow details', async () => {
      const rssFeedProviderFollows = await rssFeedProviderFollowsService.create(
        {
          userId: activeUser._id,
          rssfeedProviderId: rssFeedProviderData._id,
        },
      );
      const rssFeedProvidersFollowsData = await rssFeedProviderFollowsService
        .findByUserAndRssFeedProvider(
          rssFeedProviderFollows.userId.toString(),
          rssFeedProviderFollows.rssfeedProviderId.toString(),
        );
      expect(rssFeedProvidersFollowsData.rssfeedProviderId).toEqual(rssFeedProviderFollows.rssfeedProviderId);
      expect(rssFeedProvidersFollowsData.userId).toEqual(rssFeedProviderFollows.userId);
    });
  });

  describe('#deleteById', () => {
    it('delete rss feed provider follow details', async () => {
      const rssFeedProviderFollows = await rssFeedProviderFollowsService.create(
        {
          userId: activeUser._id,
          rssfeedProviderId: rssFeedProviderData._id,
        },
      );
      await rssFeedProviderFollowsService.deleteById(rssFeedProviderFollows._id);
      const rssFeedProviderFollowDetails = await rssFeedProviderFollowsService.findById(rssFeedProviderFollows._id);
      expect(rssFeedProviderFollowDetails).toBeNull();
    });
  });
});
