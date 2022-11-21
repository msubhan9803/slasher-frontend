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
import { dropCollections } from '../../../test/helpers/mongo-helpers';

describe('BlocksService', () => {
  let app: INestApplication;
  let connection: Connection;
  let searchService: SearchService;
  let usersService: UsersService;
  let blocksService: BlocksService;
  let user0: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
  let user3: UserDocument;
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await dropCollections(connection);

    user0 = await usersService.create(userFactory.build({ userName: 'Hannibal' }));
    user1 = await usersService.create(userFactory.build({ userName: 'Michael' }));
    user2 = await usersService.create(userFactory.build({ userName: 'Freddy' }));
    user3 = await usersService.create(userFactory.build({ userName: 'Count Orlok' }));
    await blocksModel.create({
      from: user0._id,
      to: user3._id,
      reaction: BlockAndUnblockReaction.Block,
    });
    await blocksModel.create({
      from: user0._id,
      to: user2._id,
      reaction: BlockAndUnblockReaction.Block,
    });
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
      const blockUsersIds = await blocksService.getBlockedUserIdsBySender(user0._id);
      const users = await searchService.findUsers('Count Orlok', 5, 0, blockUsersIds);
      expect(users).toHaveLength(3);
    });

    it('returns the expected response for applied limit and offset', async () => {
      const blockUsersIds = await blocksService.getBlockedUserIdsBySender(user0._id);
      const users = await searchService.findUsers('Count Orlok', 2, 2, blockUsersIds);
      expect(users).toHaveLength(1);
    });

    it('when exclude user ids is not apply than expected response', async () => {
      const users = await searchService.findUsers('Count Orlok', 10);
      expect(users).toHaveLength(1);
    });
  });
});
