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
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';

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
    connection = moduleRef.get<Connection>(getConnectionToken());
    blocksService = moduleRef.get<BlocksService>(BlocksService);
    usersService = moduleRef.get<UsersService>(UsersService);
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

    user0 = await usersService.create(userFactory.build({ userName: 'Hannibal' }));
    user1 = await usersService.create(userFactory.build({ userName: 'Michael' }));
    user2 = await usersService.create(userFactory.build({ userName: 'Freddy' }));
    user3 = await usersService.create(userFactory.build({ userName: 'Count Orlok' }));
    await blocksModel.create({
      from: user2.id,
      to: user3.id,
      reaction: BlockAndUnblockReaction.Block,
    });
  });

  it('should be defined', () => {
    expect(blocksService).toBeDefined();
  });

  describe('#createBlock', () => {
    it('successfully create block', async () => {
      await blocksService.createBlock(user0.id, user1.id);
      expect(await blocksModel.findOne({ from: user0.id })).toBeTruthy();
    });
  });

  describe('#deleteBlock', () => {
    it('delete block successfully', async () => {
      await blocksService.deleteBlock(user2.id, user3.id);
      expect(await blocksModel.findOne({ from: user2.id })).toBeNull();
    });
  });

  describe('#getBlockedUserIdsBySender', () => {
    it('get all user ids by sender', async () => {
      await blocksModel.create({
        from: user0.id,
        to: user3.id,
        reaction: BlockAndUnblockReaction.Block,
      });
      await blocksModel.create({
        from: user0.id,
        to: user2.id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const block = await blocksService.getBlockedUserIdsBySender(user0.id);
      expect(block).toHaveLength(2);
    });
  });

  describe('#getBlockedUsersBySender', () => {
    it('get blocked users by sender', async () => {
      await blocksModel.create({
        from: user0.id,
        to: user3.id,
        reaction: BlockAndUnblockReaction.Block,
      });
      await blocksModel.create({
        from: user0.id,
        to: user2.id,
        reaction: BlockAndUnblockReaction.Block,
      });
      const block = await blocksService.getBlockedUsersBySender(user0.id, 5);
      expect(block).toHaveLength(2);
    });

    it('returns the expected response for applied limit and offset', async () => {
      await blocksModel.create({
        from: user0.id,
        to: user3.id,
        reaction: BlockAndUnblockReaction.Block,
      });
      await blocksModel.create({
        from: user0.id,
        to: user2.id,
        reaction: BlockAndUnblockReaction.Block,
      });
      expect(
        await blocksService.getBlockedUsersBySender(user0.id, 1, 1),
      ).toHaveLength(1);
    });
  });

  describe('#deleteAllByUserId', () => {
    it('delete the block data successful of passed userId (blocks from the user and to the user)', async () => {
      await blocksModel.create({
        from: user0.id,
        to: user3.id,
        reaction: BlockAndUnblockReaction.Block,
      });
      await blocksModel.create({
        from: user0.id,
        to: user2.id,
        reaction: BlockAndUnblockReaction.Block,
      });
      await blocksModel.create({
        from: user3.id,
        to: user0.id,
        reaction: BlockAndUnblockReaction.Block,
      });
      await blocksService.deleteAllByUserId(user0.id);
      expect(await blocksModel.find({ from: user0.id })).toHaveLength(0);
      expect(await blocksModel.find({ to: user0.id })).toHaveLength(0);
    });
  });

  describe('#blockExistsBetweenUsers', () => {
    it('returns true when a block exists between users', async () => {
      await blocksModel.create({
        from: user0.id,
        to: user2.id,
        reaction: BlockAndUnblockReaction.Block,
      });
      // Checking that block check works in both directions (from/to)
      expect(await blocksService.blockExistsBetweenUsers(user0.id, user2.id)).toBe(true);
      expect(await blocksService.blockExistsBetweenUsers(user2.id, user0.id)).toBe(true);
    });

    it('returns false when a block does not exist between users', async () => {
      expect(await blocksService.blockExistsBetweenUsers(user0.id, user1.id)).toBe(false);
    });
  });
});
