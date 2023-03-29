/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AppModule } from '../../app.module';
import { UsersService } from './users.service';
import { userFactory } from '../../../test/factories/user.factory';
import { ActiveStatus } from '../../schemas/user/user.enums';
import { UserDocument } from '../../schemas/user/user.schema';
import { pick } from '../../utils/object-utils';
import { SocketUser, SocketUserDocument } from '../../schemas/socketUser/socketUser.schema';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { BlockAndUnblockReaction } from '../../schemas/blockAndUnblock/blockAndUnblock.enums';
import { BlocksService } from '../../blocks/providers/blocks.service';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../schemas/blockAndUnblock/blockAndUnblock.schema';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';

describe('UsersService', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let socketUsersModel: Model<SocketUserDocument>;
  let blocksModel: Model<BlockAndUnblockDocument>;
  let blocksService: BlocksService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    socketUsersModel = moduleRef.get<Model<SocketUserDocument>>(getModelToken(SocketUser.name));
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    blocksService = moduleRef.get<BlocksService>(BlocksService);

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
    expect(usersService).toBeDefined();
  });

  describe('#create', () => {
    it('successfully creates a user', async () => {
      const userData = userFactory.build(
        { status: ActiveStatus.Active },
      );
      userData.verification_token = uuidv4();
      const user = await usersService.create(userData);
      expect(await usersService.findById(user.id)).toBeTruthy();
    });
  });

  describe('#findAll', () => {
    beforeEach(async () => {
      await usersService.create(
        userFactory.build(),
      );
      await usersService.create(
        userFactory.build(),
      );
    });
    it('finds the expected set of users', async () => {
      expect(await usersService.findAll(1, 10)).toHaveLength(2);
    });
  });

  describe('#usersExistAndAreActive', () => {
    let users;
    beforeEach(async () => {
      users = await Promise.all([
        userFactory.build(),
        userFactory.build(),
        userFactory.build({ deleted: true }),
        userFactory.build({ status: ActiveStatus.Inactive }),
      ].map((userData) => usersService.create(userData)));
    });
    it('returns the expected response when requesting only active users', async () => {
      expect(await usersService.usersExistAndAreActive([users[0]._id, users[1]._id])).toBeTruthy();
    });
    it('returns the expected response when requesting a mix of active and deleted users', async () => {
      expect(await usersService.usersExistAndAreActive([users[0]._id, users[1]._id, users[2]._id])).toBeFalsy();
    });
    it('returns the expected response when requesting a mix of active and inactive users', async () => {
      expect(await usersService.usersExistAndAreActive([users[0]._id, users[1]._id, users[3]._id])).toBeFalsy();
    });
  });

  describe('#findByEmail', () => {
    let user: UserDocument;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build(),
      );
    });

    it('finds the expected user using the same-case email', async () => {
      expect((await usersService.findByEmail(user.email))._id).toEqual(
        user._id,
      );
    });

    it('finds the expected user using a lower-case variant of the email', async () => {
      expect(
        (await usersService.findByEmail(user.email.toLowerCase()))._id,
      ).toEqual(user._id);
    });

    it('finds the expected user using an upper-case variant of the email', async () => {
      expect(
        (await usersService.findByEmail(user.email.toUpperCase()))._id,
      ).toEqual(user._id);
    });
  });

  describe('#findByUsername', () => {
    let user: UserDocument;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build(),
      );
    });

    it('finds the expected user using the same-case userName', async () => {
      expect((await usersService.findByUsername(user.userName))._id).toEqual(
        user._id,
      );
    });

    it('finds the expected user using a lower-case variant of the userName', async () => {
      expect(
        (await usersService.findByUsername(user.userName.toLowerCase()))._id,
      ).toEqual(user._id);
    });

    it('finds the expected user using an upper-case variant of the userName', async () => {
      expect(
        (await usersService.findByUsername(user.userName.toUpperCase()))._id,
      ).toEqual(user._id);
    });
  });

  describe('#findByEmailOrUsername', () => {
    let user;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build(),
      );
    });
    it('finds the expected user by email', async () => {
      expect(
        (await usersService.findByEmailOrUsername(user.email))._id,
      ).toEqual(user._id);
    });
    it('finds the expected user by userName', async () => {
      expect(
        (await usersService.findByEmailOrUsername(user.userName))._id,
      ).toEqual(user._id);
    });
  });

  describe('#validatePasswordResetToken', () => {
    let user;
    beforeEach(async () => {
      const userData = userFactory.build();
      userData.resetPasswordToken = uuidv4();
      user = await usersService.create(userData);
    });
    it('returns true when user email and resetPasswordToken are found', async () => {
      expect(
        await usersService.resetPasswordTokenIsValid(
          user.email,
          user.resetPasswordToken,
        ),
      ).toBe(true);
    });

    it('returns true when user email does not exist', async () => {
      const userEmail = 'non-existing@gmail.com';
      expect(
        await usersService.resetPasswordTokenIsValid(
          userEmail,
          user.resetPasswordToken,
        ),
      ).toBe(false);
    });
    it('returns false when resetPasswordToken does not exist', async () => {
      const userResetPasswordToken = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      expect(
        await usersService.resetPasswordTokenIsValid(
          user.email,
          userResetPasswordToken,
        ),
      ).toBe(false);
    });

    it('returns false when neither user nor resetPasswordToken exist', async () => {
      const userResetPasswordToken = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      const userEmail = 'non-existing@gmail.com';
      expect(
        await usersService.resetPasswordTokenIsValid(
          userEmail,
          userResetPasswordToken,
        ),
      ).toBe(false);
    });
  });

  describe('#verificationTokenIsValid', () => {
    let user;
    beforeEach(async () => {
      const userData = userFactory.build();
      userData.verification_token = uuidv4();
      user = await usersService.create(userData);
    });
    it('finds the expected user by email and verification_token', async () => {
      expect(
        await usersService.verificationTokenIsValid(
          user.email,
          user.verification_token,
        ),
      ).toBe(true);
    });

    it('returns false when email does not exist', async () => {
      const userEmail = 'non-existinging-user@gmail.com';
      expect(
        await usersService.verificationTokenIsValid(
          userEmail,
          user.verification_token,
        ),
      ).toBe(false);
    });

    it('returns false when verification_token does not exist', async () => {
      const userVerificationToken = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      expect(
        await usersService.verificationTokenIsValid(
          user.email,
          userVerificationToken,
        ),
      ).toBe(false);
    });

    it('when verification_token or email is not exists', async () => {
      const userVerificationToken = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      const userEmail = 'non-existinging-user@gmail.com';
      expect(
        await usersService.verificationTokenIsValid(
          userEmail,
          userVerificationToken,
        ),
      ).toBe(false);
    });
  });

  describe('#update', () => {
    let user;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build(),
      );
    });
    it('finds the expected user and update the details', async () => {
      const userData = {
        firstName: 'Test1 User',
        userName: 'test1_user',
      };
      const updatedUser = await usersService.update(user._id, userData);
      const reloadedUser = await usersService.findById(updatedUser.id);
      expect(reloadedUser.firstName).toEqual(userData.firstName);
      expect(reloadedUser.userName).toEqual(userData.userName);
      expect(reloadedUser.email).toEqual(user.email);
    });
  });

  describe('#suggestUserName', () => {
    let user0;
    let user1;
    let user2;
    let excludedUserIds;
    beforeEach(async () => {
      user0 = await usersService.create(
        userFactory.build(
          { userName: 'test-user1' },
        ),
      );
      user1 = await usersService.create(
        userFactory.build(
          { userName: 'test-user2' },
        ),
      );
      user2 = await usersService.create(
        userFactory.build(
          { userName: 'test-user3' },
        ),
      );
      await usersService.create(
        userFactory.build(
          { userName: 'test1' },
        ),
      );
      await usersService.create(
        userFactory.build(
          { userName: 'test2' },
        ),
      );
      await usersService.create(
        userFactory.build(
          { userName: 'test3', status: ActiveStatus.Deactivated, deleted: false },
        ),
      );
      await usersService.create(
        userFactory.build(
          { userName: 'test4', status: ActiveStatus.Active, deleted: true },
        ),
      );
      await usersService.create(
        userFactory.build(
          { userName: 'te2', status: ActiveStatus.Deactivated, deleted: true },
        ),
      );
      await blocksModel.create({
        from: user0._id,
        to: user1._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      await blocksModel.create({
        from: user0._id,
        to: user2._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      excludedUserIds = await blocksService.getBlockedUserIdsBySender(user0._id);
      excludedUserIds.push(user0._id);
    });
    it('when query exists, returns expected response, with orders sorted alphabetically by username', async () => {
      const query = 'Te';
      const limit = 5;
      const suggestUserNames = await usersService.suggestUserName(query, limit, true, excludedUserIds);
      expect(suggestUserNames).toEqual([
        pick(await usersService.findByUsername('test1'), ['userName', 'id', 'profilePic']),
        pick(await usersService.findByUsername('test2'), ['userName', 'id', 'profilePic']),
      ]);
      expect(suggestUserNames.map((suggestUserName) => suggestUserName.userName)).not.toContain('test4');
    });

    it('when query is exists and limited is applied, returns expected response', async () => {
      const query = 'te';
      const limit = 1;
      const suggestUserNames = await usersService.suggestUserName(query, limit, true, excludedUserIds);
      expect(suggestUserNames).toHaveLength(1);
    });

    it('when query is wrong than expected response', async () => {
      const query = 'wq';
      const limit = 5;
      const suggestUserNames = await usersService.suggestUserName(query, limit, true, excludedUserIds);
      expect(suggestUserNames).toEqual([]);
    });

    it('when activeOnly is false then it gives expected response', async () => {
      const query = 'TE';
      const limit = 5;
      const suggestUserNames = await usersService.suggestUserName(query, limit, false, excludedUserIds);
      expect(suggestUserNames).toHaveLength(5);
    });
  });

  describe('#createSocketUserEntry', () => {
    let user;
    const socketId = 'abc123';
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build(),
      );
    });
    it('successfully creates a SocketUser with the correct property values', async () => {
      const socketUser = await usersService.createSocketUserEntry(socketId, user.id);
      const reloadedSocketUser = await socketUsersModel.findById(socketUser.id);
      expect(reloadedSocketUser.userId).toEqual(socketUser.userId);
      expect(reloadedSocketUser.socketId).toEqual(socketUser.socketId);
    });
  });

  describe('#findBySocketId', () => {
    let user;
    const socketId = 'abc123';
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build(),
      );
      await usersService.createSocketUserEntry(socketId, user.id);
    });
    it('finds the expected User by socket id', async () => {
      expect((await usersService.findBySocketId(socketId))._id).toEqual(user._id);
    });
  });

  describe('#findSocketIdsForUser', () => {
    let user;
    const socketIds = ['abc123', 'def456'];
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build(),
      );
      await usersService.createSocketUserEntry(socketIds[0], user.id);
      await usersService.createSocketUserEntry(socketIds[1], user.id);
    });
    it('finds the expected socket ids for the user', async () => {
      expect((await usersService.findSocketIdsForUser(user.id)).sort()).toEqual(socketIds.sort());
    });

    it('returns an empty array when no SocketUser entries are found for a user', async () => {
      expect(await usersService.findSocketIdsForUser(
        (await usersService.create(userFactory.build())).id,
      )).toHaveLength(0);
    });
  });

  describe('#deleteSocketUserEntry', () => {
    let user;
    const socketId = 'abc123';
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build(),
      );
      await usersService.createSocketUserEntry(socketId, user.id);
    });
    it('finds the expected User by socket id', async () => {
      expect((await usersService.findBySocketId(socketId))._id).toEqual(user._id);
      await usersService.deleteSocketUserEntry(socketId);
      expect((await usersService.findBySocketId(socketId))).toBeNull();
    });
  });

  describe('#getSocketUserCount', () => {
    it('finds the expected count', async () => {
      expect(await usersService.getSocketUserCount()).toBe(0);
      await usersService.createSocketUserEntry('123', (await usersService.create(userFactory.build())).id);
      expect(await usersService.getSocketUserCount()).toBe(1);
      await usersService.createSocketUserEntry('456', (await usersService.create(userFactory.build())).id);
      expect(await usersService.getSocketUserCount()).toBe(2);
    });
  });

  describe('#updateNewNotificationCount', () => {
    it('finds the expected user and update newNotificationCount', async () => {
      const user = await usersService.create(userFactory.build());
      const userData = await usersService.updateNewNotificationCount(user.id);
      expect(userData.newNotificationCount).toBe(1);
    });
  });

  describe('#updateNewMessageCount', () => {
    it('finds the expected user and update newMessageCount', async () => {
      const user = await usersService.create(userFactory.build());
      const userData = await usersService.updateNewMessageCount(user.id);
      expect(userData.newMessageCount).toBe(1);
    });
  });

  describe('#updateNewFriendRequestCount', () => {
    it('finds the expected user and update newFriendRequestCount', async () => {
      const user = await usersService.create(userFactory.build());
      const userData = await usersService.updateNewFriendRequestCount(user.id);
      expect(userData.newFriendRequestCount).toBe(1);
    });
  });
});
