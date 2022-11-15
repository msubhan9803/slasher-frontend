import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { BlocksService } from './blocks.service';
import { UsersService } from '../../users/providers/users.service';
import { UserDocument } from '../../schemas/user/user.schema';
import { userFactory } from '../../../test/factories/user.factory';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../schemas/blockAndUnblock/blockAndUnblock.enums';

describe('BlocksService', () => {
  let app: INestApplication;
  let connection: Connection;
  let blocksService: BlocksService;
  let usersService: UsersService;
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
    blocksService = moduleRef.get<BlocksService>(BlocksService);
    usersService = moduleRef.get<UsersService>(UsersService);
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();
    user0 = await usersService.create(userFactory.build({ userName: 'Hannibal' }));
    user1 = await usersService.create(userFactory.build({ userName: 'Michael' }));
    user2 = await usersService.create(userFactory.build({ userName: 'Freddy' }));
    user3 = await usersService.create(userFactory.build({ userName: 'Count Orlok' }));
    await blocksModel.create({
      from: user2._id,
      to: user3._id,
      reaction: BlockAndUnblockReaction.Block,
    });
  });

  it('should be defined', () => {
    expect(blocksService).toBeDefined();
  });

  describe('#createBlock', () => {
    it('successfully create block', async () => {
      await blocksService.createBlock(user0._id, user1._id);
      expect(await blocksModel.findOne({ from: user0._id })).toBeTruthy();
    });
  });

  describe('#deleteBlock', () => {
    it('delete block successfully', async () => {
      await blocksService.deleteBlock(user2._id, user3._id);
      expect(await blocksModel.findOne({ from: user2._id })).toBeNull();
    });
  });

  describe('#getBlockedUserIdsBySender', () => {
    it('get all user ids by sender', async () => {
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
      const block = await blocksService.getBlockedUserIdsBySender(user0._id);
      expect(block).toHaveLength(2);
    });
  });
});
