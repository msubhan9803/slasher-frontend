import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { RssFeedProvidersService } from './rssFeedProviders.service';
import { RssFeedProviderDocument } from '../../schemas/rssFeedProvider/rssFeedProvider.schema';
import { rssFeedProviderFactory } from '../../../test/factories/rssFeedProviders.factory';
import { RssFeedProviderActiveStatus } from '../../schemas/rssFeedProvider/rssFeedProvider.enums';

describe('EventService', () => {
  let app: INestApplication;
  let connection: Connection;
  let rssFeedProvidersService: RssFeedProvidersService;
  let rssFeedProvider: Partial<RssFeedProviderDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    rssFeedProvidersService = moduleRef.get<RssFeedProvidersService>(RssFeedProvidersService);

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();
    rssFeedProvider = await rssFeedProvidersService.create(rssFeedProviderFactory.build());
  });

  it('should be defined', () => {
    expect(rssFeedProvidersService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a rss feed provider', async () => {
      const rssFeedProviderData = rssFeedProviderFactory.build();
      const rssFeedProvidersDetails = await rssFeedProvidersService.create(rssFeedProviderData);
      expect(await rssFeedProvidersService.findById(rssFeedProvidersDetails._id, false)).toBeTruthy();
    });
  });

  describe('#update', () => {
    it('finds the expected rss feed provider and update the details', async () => {
      const rssFeedProviderJson = {
        title: 'title test 20',
      };
      const updatedRssFeedProvider = await rssFeedProvidersService.update(rssFeedProvider._id, rssFeedProviderJson);
      const reloadedRssFeedProvider = await rssFeedProvidersService.findById(updatedRssFeedProvider._id, false);
      expect(reloadedRssFeedProvider.title).toEqual(rssFeedProviderJson.title);
      expect(reloadedRssFeedProvider.sortTitle).toEqual(rssFeedProvider.sortTitle);
    });
  });

  describe('#findById', () => {
    it('finds the expected rss feed provider details', async () => {
      const rssFeedProvidersDetails = await rssFeedProvidersService.findById(rssFeedProvider._id, false);
      expect(rssFeedProvidersDetails.title).toEqual(rssFeedProvider.title);
    });

    it('finds the expected rss feed provider details that has not deleted and active status', async () => {
      const activeRssFeedProvider = await rssFeedProvidersService.create(
        rssFeedProviderFactory.build({
          status: RssFeedProviderActiveStatus.Active,
        }),
      );
      const rssFeedProvidersDetails = await rssFeedProvidersService.findById(activeRssFeedProvider._id, true);
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
      expect(rssFeedProvidersList).toHaveLength(10);
    });

    it('finds the expected rss feed provider details that has not deleted and active status', async () => {
      const limit = 10;
      const rssFeedProvidersList = await rssFeedProvidersService.findAll(limit, true);
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
});
