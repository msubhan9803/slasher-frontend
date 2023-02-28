import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { RssFeedService } from './rss-feed.service';
import { rssFeedFactory } from '../../../test/factories/rss-feed.factory';
import { RssFeedDocument } from '../../schemas/rssFeed/rssFeed.schema';
import { RssFeedDeletionStatus } from '../../schemas/rssFeed/rssFeed.enums';
import { RssFeedProvidersService } from '../../rss-feed-providers/providers/rss-feed-providers.service';
import { rssFeedProviderFactory } from '../../../test/factories/rss-feed-providers.factory';
import { RssFeedProviderDocument } from '../../schemas/rssFeedProvider/rssFeedProvider.schema';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';

describe('RssFeedService', () => {
  let app: INestApplication;
  let connection: Connection;
  let rssFeedService: RssFeedService;
  let rssFeedProvidersService: RssFeedProvidersService;
  let rssFeedProviderData: Partial<RssFeedProviderDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    rssFeedService = moduleRef.get<RssFeedService>(RssFeedService);
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);

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

    rssFeedProviderData = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
  });

  it('should be defined', () => {
    expect(rssFeedService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a rss feed', async () => {
      const rssFeedData = rssFeedFactory.build({
        rssfeedProviderId: rssFeedProviderData._id,
      });
      const rssFeed = await rssFeedService.create(rssFeedData);
      expect(await rssFeedService.findById(rssFeed.id, false)).toBeTruthy();
    });
  });

  describe('#update', () => {
    let rssFeed;
    beforeEach(async () => {
      rssFeed = await rssFeedService.create(
        rssFeedFactory.build({
          rssfeedProviderId: rssFeedProviderData._id,
        }),
      );
    });
    it('finds the expected rss feed and update the details', async () => {
      const rssFeedData = {
        title: 'Test1 Rss Feed',
      };
      const updatedRssFeed = await rssFeedService.update(rssFeed._id, rssFeedData);
      const reloadedRssFeed = await rssFeedService.findById(updatedRssFeed.id, false);
      expect(reloadedRssFeed.title).toEqual(rssFeedData.title);
      expect(reloadedRssFeed.rssfeedProviderId).toEqual(rssFeed.rssfeedProviderId);
    });
  });

  describe('#findById', () => {
    let rssFeed: RssFeedDocument;
    beforeEach(async () => {
      rssFeed = await rssFeedService.create(
        rssFeedFactory.build(
          {
            deleted: RssFeedDeletionStatus.Deleted,
            rssfeedProviderId: rssFeedProviderData._id,
          },
        ),
      );
    });
    it('finds the expected rss feed details', async () => {
      const rssFeedDetails = await rssFeedService.findById(rssFeed.id, false);
      expect(rssFeedDetails.title).toEqual(rssFeed.title);
    });

    it('finds the expected rss feed details that has not deleted', async () => {
      const nonActiveRssFeed = await rssFeedService.create(
        rssFeedFactory.build({
          rssfeedProviderId: rssFeedProviderData._id,
        }),
      );

      const rssFeedDetail = await rssFeedService.findById(nonActiveRssFeed.id, true);
      expect(rssFeedDetail.title).toEqual(nonActiveRssFeed.title);
    });
  });
});
