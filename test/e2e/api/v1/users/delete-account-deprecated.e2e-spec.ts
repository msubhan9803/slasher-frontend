import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { userFactory } from '../../../../factories/user.factory';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { FriendsService } from '../../../../../src/friends/providers/friends.service';
import { Friend, FriendDocument } from '../../../../../src/schemas/friend/friend.schema';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { SuggestBlock, SuggestBlockDocument } from '../../../../../src/schemas/suggestBlock/suggestBlock.schema';
import { SuggestBlockReaction } from '../../../../../src/schemas/suggestBlock/suggestBlock.enums';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Users / delete account (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
  let configService: ConfigService;
  let friendsService: FriendsService;
  let friendsModel: Model<FriendDocument>;
  let blocksModel: Model<BlockAndUnblockDocument>;
  let suggestBlocksModel: Model<SuggestBlockDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    friendsModel = moduleRef.get<Model<FriendDocument>>(getModelToken(Friend.name));
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    suggestBlocksModel = moduleRef.get<Model<SuggestBlockDocument>>(getModelToken(SuggestBlock.name));

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

    activeUser = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    user2 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    await friendsService.createFriendRequest(activeUser.id, user1._id.toString());
    await friendsService.createFriendRequest(user1._id.toString(), activeUser.id);
    await friendsService.createFriendRequest(activeUser.id, user2._id.toString());
    await blocksModel.create({
      from: activeUser.id,
      to: user1._id,
      reaction: BlockAndUnblockReaction.Block,
    });
    await blocksModel.create({
      from: activeUser.id,
      to: user2._id,
      reaction: BlockAndUnblockReaction.Block,
    });
    await blocksModel.create({
      from: user1._id,
      to: activeUser.id,
      reaction: BlockAndUnblockReaction.Block,
    });
    await suggestBlocksModel.create({
      from: activeUser.id,
      to: user1._id,
      reaction: SuggestBlockReaction.Block,
    });
    await suggestBlocksModel.create({
      from: user1._id,
      to: activeUser.id,
      reaction: SuggestBlockReaction.Block,
    });
  });

  describe('DELETE /api/v1/users/delete-account', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).delete('/api/v1/users/delete-account').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('delete account request', () => {
      it('if activeUser delete account then it returns expected response', async () => {
        const userId = activeUser.id;
        const oldHashedPassword = activeUser.password;

        const response = await request(app.getHttpServer())
          .delete(`/api/v1/users/delete-account?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.OK);
        expect(response.body).toEqual({ success: true });

        const userData = await usersService.findById(activeUser.id, false);
        expect(userData.deleted).toBe(true); // check delete
        expect(userData.password).not.toEqual(oldHashedPassword); // check password change

        const fromOrToQuery = {
          $or: [
            { from: activeUser.id },
            { to: activeUser.id },
          ],
        };
        const friends = await friendsModel.find(fromOrToQuery);
        const blocks = await blocksModel.find(fromOrToQuery);
        const suggestBlocks = await suggestBlocksModel.find(fromOrToQuery);

        const fromQuery = { from: activeUser.id };
        const deleteFriendData = await friendsModel.find(fromQuery);

        expect(deleteFriendData).toHaveLength(0);
        expect(friends).toHaveLength(0);
        expect(blocks).toHaveLength(0);
        expect(suggestBlocks).toHaveLength(0);
      });

      it('if query parameter userId different than activeUser then it returns expected response', async () => {
        const userId = user1._id;
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/users/delete-account?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain("Supplied userId param does not match current user's id.");
      });
    });

    describe('Validation', () => {
      it('userId should not be empty', async () => {
        const userId = '';
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/users/delete-account?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId should not be empty',
        );
      });

      it('userId must be a mongodb id', async () => {
        const userId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/users/delete-account?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId must be a mongodb id',
        );
      });
    });
  });
});
