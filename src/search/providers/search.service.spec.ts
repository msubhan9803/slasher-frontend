import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { SearchService } from './search.service';
import { UsersService } from '../../users/providers/users.service';
import { BlocksService } from '../../blocks/providers/blocks.service';
import { UserDocument } from '../../schemas/user/user.schema';
import { userFactory } from '../../../test/factories/user.factory';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../schemas/blockAndUnblock/blockAndUnblock.enums';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { ActiveStatus } from '../../schemas/user/user.enums';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';

describe('SearchService', () => {
  let app: INestApplication;
  let connection: Connection;
  let searchService: SearchService;
  let usersService: UsersService;
  let blocksService: BlocksService;
  let user0: UserDocument;
  let user1: UserDocument;
  let blocksModel: Model<BlockAndUnblockDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    searchService = moduleRef.get<SearchService>(SearchService);
    usersService = moduleRef.get<UsersService>(UsersService);
    blocksService = moduleRef.get<BlocksService>(BlocksService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));

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

    user0 = await usersService.create(userFactory.build({ userName: 'Count Hannibal' }));
    user1 = await usersService.create(userFactory.build({ userName: 'Count Michael' }));
    await usersService.create(userFactory.build({
      userName: 'Count Denial',
      deleted: true,
      status: ActiveStatus.Active,
    }));
    await usersService.create(userFactory.build({
      userName: 'Count Jonny',
      deleted: false,
      status: ActiveStatus.Inactive,
    }));
    await usersService.create(userFactory.build({ userName: 'Freddy' }));
    await usersService.create(userFactory.build({ userName: 'Count Orlok' }));
    await usersService.create(userFactory.build({ userName: 'Count Jack' }));
    await blocksModel.create({
      from: user0._id,
      to: user1._id,
      reaction: BlockAndUnblockReaction.Block,
    });
  });

  it('should be defined', () => {
    expect(searchService).toBeDefined();
  });

  describe('#findUsers', () => {
    it('returns the expected users', async () => {
      const excludedUserIds = await blocksService.getUserIdsForBlocksToOrFromUser(user0.id);
      excludedUserIds.push(user0.id);
      const users = await searchService.findUsers('Count', 5, 0, excludedUserIds);
      expect(users).toHaveLength(2);
    });

    it('returns the expected response for applied limit and offset', async () => {
      const excludedUserIds = await blocksService.getUserIdsForBlocksToOrFromUser(user0.id);
      excludedUserIds.push(user0.id);
      const users = await searchService.findUsers('Count', 1, 1, excludedUserIds);
      expect(users).toHaveLength(1);
    });

    it('when exclude user ids is not apply than expected response', async () => {
      const users = await searchService.findUsers('Count', 10);
      expect(users).toHaveLength(4);
    });
  });
});
