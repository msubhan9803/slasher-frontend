import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { RssFeedProvidersService } from './rss-feed-providers.service';
import { RssFeedProviderDocument } from '../../schemas/rssFeedProvider/rssFeedProvider.schema';
import { rssFeedProviderFactory } from '../../../test/factories/rss-feed-providers.factory';
import {
  RssFeedProviderActiveStatus,
  RssFeedProviderAutoFollow,
  RssFeedProviderDeletionStatus,
} from '../../schemas/rssFeedProvider/rssFeedProvider.enums';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';

describe('RssFeedProvidersService', () => {
  let app: INestApplication;
  let connection: Connection;
  let rssFeedProvidersService: RssFeedProvidersService;
  let rssFeedProvider: Partial<RssFeedProviderDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
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
    rssFeedProvider = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
  });

  it('should be defined', () => {
    expect(rssFeedProvidersService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a rss feed provider', async () => {
      const rssFeedProviderData = rssFeedProviderFactory.build();
      const rssFeedProvidersDetails = await rssFeedProvidersService.create(rssFeedProviderData);
      expect(await rssFeedProvidersService.findById(rssFeedProvidersDetails.id, false)).toBeTruthy();
    });
  });

  describe('#update', () => {
    it('finds the expected rss feed provider and update the details', async () => {
      const rssFeedProviderJson = {
        title: 'title test 20',
      };
      const updatedRssFeedProvider = await rssFeedProvidersService.update(rssFeedProvider.id, rssFeedProviderJson);
      const reloadedRssFeedProvider = await rssFeedProvidersService.findById(updatedRssFeedProvider.id, false);
      expect(reloadedRssFeedProvider.title).toEqual(rssFeedProviderJson.title);
      expect(reloadedRssFeedProvider.sortTitle).toEqual(rssFeedProvider.sortTitle);
    });
  });

  describe('#findById', () => {
    it('finds the expected rss feed provider details', async () => {
      const rssFeedProvidersDetails = await rssFeedProvidersService.findById(rssFeedProvider.id, false);
      expect(rssFeedProvidersDetails.title).toEqual(rssFeedProvider.title);
    });

    it('finds the expected rss feed provider details that has not deleted and active status', async () => {
      const activeRssFeedProvider = await rssFeedProvidersService.create(
        rssFeedProviderFactory.build({
          status: RssFeedProviderActiveStatus.Active,
        }),
      );
      const rssFeedProvidersDetails = await rssFeedProvidersService.findById(activeRssFeedProvider.id, true);
      expect(rssFeedProvidersDetails.title).toEqual(activeRssFeedProvider.title);
    });
  });

  describe('#findAll', () => {
    beforeEach(async () => {
      for (let index = 0; index < 5; index += 1) {
        await rssFeedProvidersService.create(
          rssFeedProviderFactory.build(),
        );
        await rssFeedProvidersService.create(
          rssFeedProviderFactory.build({
            status: RssFeedProviderActiveStatus.Active,
          }),
        );
      }
    });
    it('finds the expected rss feed provider details that has deleted and active status', async () => {
      const limit = 10;
      const rssFeedProvidersList = await rssFeedProvidersService.findAll(limit, false);
      for (let index = 1; index < rssFeedProvidersList.length; index += 1) {
        expect(rssFeedProvidersList[index - 1].sortTitle < rssFeedProvidersList[index].sortTitle).toBe(true);
      }
      expect(rssFeedProvidersList).toHaveLength(10);
    });

    it('finds the expected rss feed provider details that has not deleted and active status', async () => {
      const limit = 10;
      const rssFeedProvidersList = await rssFeedProvidersService.findAll(limit, true);
      for (let index = 1; index < rssFeedProvidersList.length; index += 1) {
        expect(rssFeedProvidersList[index - 1].sortTitle < rssFeedProvidersList[index].sortTitle).toBe(true);
      }
      expect(rssFeedProvidersList).toHaveLength(5);
    });

    describe('when `after` argument is supplied', () => {
      it('returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResults = await rssFeedProvidersService.findAll(limit, true);
        const secondResults = await rssFeedProvidersService.findAll(limit, true, firstResults[limit - 1].id);
        expect(firstResults).toHaveLength(3);
        expect(secondResults).toHaveLength(2);
      });
    });
  });

  describe('#findAllAutoFollowRssFeedProviders', () => {
    it('finds all active, non-deleted RssFeedProviders that have auto_follow set to RssFeedProviderAutoFollow.Yes', async () => {
      for (let i = 0; i < 3; i += 1) {
        await rssFeedProvidersService.create(rssFeedProviderFactory.build({
          auto_follow: RssFeedProviderAutoFollow.Yes,
          status: RssFeedProviderActiveStatus.Active,
          deleted: RssFeedProviderDeletionStatus.NotDeleted,
        }));
        await rssFeedProvidersService.create(rssFeedProviderFactory.build({
          auto_follow: RssFeedProviderAutoFollow.No,
          status: RssFeedProviderActiveStatus.Active,
          deleted: RssFeedProviderDeletionStatus.Deleted,
        }));
      }
      const rssFeedProvidersDetails = await rssFeedProvidersService.findAllAutoFollowRssFeedProviders();
      expect(rssFeedProvidersDetails).toHaveLength(3);
    });
  });
});
