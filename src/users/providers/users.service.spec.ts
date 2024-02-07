/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { DateTime } from 'luxon';
import mongoose, { Connection, Model, Types } from 'mongoose';
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
import { ChatService } from '../../chat/providers/chat.service';
import { Friend, FriendDocument } from '../../schemas/friend/friend.schema';
import { SuggestBlock, SuggestBlockDocument } from '../../schemas/suggestBlock/suggestBlock.schema';
import { SuggestBlockReaction } from '../../schemas/suggestBlock/suggestBlock.enums';
import { FriendsService } from '../../friends/providers/friends.service';

describe('UsersService', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let socketUsersModel: Model<SocketUserDocument>;
  let blocksModel: Model<BlockAndUnblockDocument>;
  let friendsModel: Model<FriendDocument>;
  let suggestBlocksModel: Model<SuggestBlockDocument>;
  let blocksService: BlocksService;
  let friendsService: FriendsService;
  let chatService: ChatService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    chatService = moduleRef.get<ChatService>(ChatService);
    socketUsersModel = moduleRef.get<Model<SocketUserDocument>>(getModelToken(SocketUser.name));
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));
    friendsModel = moduleRef.get<Model<FriendDocument>>(getModelToken(Friend.name));
    suggestBlocksModel = moduleRef.get<Model<SuggestBlockDocument>>(getModelToken(SuggestBlock.name));
    blocksService = moduleRef.get<BlocksService>(BlocksService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);

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
      expect(await usersService.findById(user.id, true)).toBeTruthy();
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

  describe('#findByDeviceId', () => {
    let user;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build({
          userDevices: [{
            device_id: 'sample-device-id',
            device_token: 'sample-device-token',
            device_type: 'sample-device-type',
            device_version: 'sample-device-version',
            app_version: 'sample-app-version',
            login_date: DateTime.fromISO('2023-06-15T00:00:00Z').toJSDate(),
          },
          {
            device_id: 'sample-device-id1',
            device_token: 'sample-device-token',
            device_type: 'sample-device-type',
            device_version: 'sample-device-version',
            app_version: 'sample-app-version',
            login_date: DateTime.fromISO('2023-06-15T00:00:00Z').toJSDate(),
          },
          ],
        }),
      );
    });
    it('returns the expected response when requesting userId and deviceId', async () => {
      const response = await usersService.findByDeviceId('sample-device-id', user._id.toString());
      expect(response.userDevices[0].device_id).toEqual(user.userDevices[0].device_id);
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
    let activeUser: UserDocument;
    let inactiveUser: UserDocument;
    let deletedUser: UserDocument;
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      inactiveUser = await usersService.create(userFactory.build({ status: ActiveStatus.Inactive }));
      deletedUser = await usersService.create(userFactory.build({ deleted: true }));
    });

    it('finds the expected user using the same-case email', async () => {
      expect((await usersService.findByEmail(activeUser.email, true))._id).toEqual(
        activeUser._id,
      );
    });

    it('finds the expected user using a lower-case variant of the email', async () => {
      expect(
        (await usersService.findByEmail(activeUser.email.toLowerCase(), true))._id,
      ).toEqual(activeUser._id);
    });

    it('finds the expected user using an upper-case variant of the email', async () => {
      expect(
        (await usersService.findByEmail(activeUser.email.toUpperCase(), true))._id,
      ).toEqual(activeUser._id);
    });

    it('does not find an inactive user or deleted user when activeOnly parameter is true', async () => {
      expect(await usersService.findByEmail(inactiveUser.email, true)).toBeNull();
      expect(await usersService.findByEmail(deletedUser.email, true)).toBeNull();
    });

    it('finds an inactive user when activeOnly parameter is false', async () => {
      expect((await usersService.findByEmail(inactiveUser.email, false))._id).toEqual(inactiveUser._id);
    });

    it('finds a deleted user when activeOnly parameter is false', async () => {
      expect((await usersService.findByEmail(deletedUser.email, false))._id).toEqual(deletedUser._id);
    });
  });

  describe('#findInactiveUserByEmail', () => {
    let activeUser: UserDocument;
    let inactiveUser: UserDocument;
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build());
      inactiveUser = await usersService.create(userFactory.build({ status: ActiveStatus.Inactive }));
    });

    it('finds an inactive user using the same-case email', async () => {
      expect((await usersService.findInactiveUserByEmail(inactiveUser.email))._id).toEqual(inactiveUser._id);
    });

    it('finds an inactive user using a lower-case variant of the email', async () => {
      expect((await usersService.findInactiveUserByEmail(inactiveUser.email.toLowerCase()))._id).toEqual(inactiveUser._id);
    });

    it('finds an inactive user using an upper-case variant of the email', async () => {
      expect((await usersService.findInactiveUserByEmail(inactiveUser.email.toUpperCase()))._id).toEqual(inactiveUser._id);
    });

    it('does not find an active user by email email', async () => {
      expect(await usersService.findInactiveUserByEmail(activeUser.email)).toBeNull();
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
      expect((await usersService.findByUsername(user.userName, true))._id).toEqual(
        user._id,
      );
    });

    it('finds the expected user using a lower-case variant of the userName', async () => {
      expect(
        (await usersService.findByUsername(user.userName.toLowerCase(), true))._id,
      ).toEqual(user._id);
    });

    it('finds the expected user using an upper-case variant of the userName', async () => {
      expect(
        (await usersService.findByUsername(user.userName.toUpperCase(), true))._id,
      ).toEqual(user._id);
    });
  });

  describe('#findExistingUserName', () => {
    let user1: UserDocument;
    let user2: UserDocument;
    beforeEach(async () => {
      user1 = await usersService.create(
        userFactory.build({
          previousUserName: ['slasher1', 'john', 'tom'],
        }),
      );
      user2 = await usersService.create(
        userFactory.build({
          previousUserName: ['devid', 'slasher2'],
        }),
      );
    });

    it('finds the username which exists in previousUserName array', async () => {
      const user = await usersService.findExistingUserName('john');
      const otherUser = await usersService.findExistingUserName('slasher2');
      const otherUser1 = await usersService.findExistingUserName('slasher3');
      expect(user[0]._id).toEqual(user1._id);
      expect(otherUser[0]._id).toEqual(user2._id);
      expect(otherUser1).toEqual([]);
    });
  });

  describe('#findNonDeletedUserByEmailOrUsername', () => {
    let activeUser;
    let inactiveUser;
    let deletedUser;
    beforeEach(async () => {
      activeUser = await usersService.create(userFactory.build({
        userName: 'ActiveUser',
      }));
      inactiveUser = await usersService.create(userFactory.build({
        status: ActiveStatus.Inactive,
        userName: 'InactiveUser',
      }));
      deletedUser = await usersService.create(userFactory.build({
        deleted: true,
        userName: 'DeletedUser',
      }));
    });
    it('finds an active user by email (case insensitive)', async () => {
      expect((await usersService.findNonDeletedUserByEmailOrUsername(activeUser.email))._id).toEqual(activeUser._id);
      expect((await usersService.findNonDeletedUserByEmailOrUsername(activeUser.email.toUpperCase()))._id).toEqual(activeUser._id);
      expect((await usersService.findNonDeletedUserByEmailOrUsername(activeUser.email.toLowerCase()))._id).toEqual(activeUser._id);
    });
    it('finds an active user by userName (case insensitive)', async () => {
      expect((await usersService.findNonDeletedUserByEmailOrUsername(activeUser.userName))._id).toEqual(activeUser._id);
      expect((await usersService.findNonDeletedUserByEmailOrUsername(activeUser.userName.toUpperCase()))._id).toEqual(activeUser._id);
      expect((await usersService.findNonDeletedUserByEmailOrUsername(activeUser.userName.toLowerCase()))._id).toEqual(activeUser._id);
    });
    it('finds an inactive user by email', async () => {
      expect(
        (await usersService.findNonDeletedUserByEmailOrUsername(inactiveUser.email))._id,
      ).toEqual(inactiveUser._id);
    });
    it('finds an inactive user by userName', async () => {
      expect(
        (await usersService.findNonDeletedUserByEmailOrUsername(inactiveUser.userName))._id,
      ).toEqual(inactiveUser._id);
    });
    it('does not find a deleted user by email', async () => {
      expect(
        await usersService.findNonDeletedUserByEmailOrUsername(deletedUser.email),
      ).toBeNull();
    });
    it('does not find a deleted user by userName', async () => {
      expect(
        await usersService.findNonDeletedUserByEmailOrUsername(deletedUser.userName),
      ).toBeNull();
    });
  });

  describe('#userNameAvailable', () => {
    let user: UserDocument;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build(),
      );
    });

    it('finds the expected user using the userName', async () => {
      const available = await usersService.userNameAvailable(user.userName);
      expect(available).toBeFalsy();
    });

    it('when user is inactive than expected response', async () => {
      const updateStatus = await usersService.update(user._id.toString(), { status: ActiveStatus.Inactive });
      const available = await usersService.userNameAvailable(updateStatus.userName);
      expect(available).toBeFalsy();
    });

    it('when user is deleted than expected response', async () => {
      const updateStatus = await usersService.update(user._id.toString(), { deleted: true });
      const available = await usersService.userNameAvailable(updateStatus.userName);
      expect(available).toBeTruthy();
    });

    it('when user is deleted and user is banned than expected response', async () => {
      const updateStatus = await usersService.update(user._id.toString(), { deleted: true, userBanned: true });
      const available = await usersService.userNameAvailable(updateStatus.userName);
      expect(available).toBeFalsy();
    });

    it('when user is banned and status is inactive than expected response', async () => {
      const updateStatus = await usersService.update(user._id.toString(), { status: ActiveStatus.Inactive, userBanned: true });
      const available = await usersService.userNameAvailable(updateStatus.userName);
      expect(available).toBeFalsy();
    });
  });

  describe('#emailAvailable', () => {
    let user: UserDocument;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build(),
      );
    });

    it('finds the expected user using the email', async () => {
      const available = await usersService.emailAvailable(user.email);
      expect(available).toBeFalsy();
    });

    it('when user is inactive than expected response', async () => {
      const updateStatus = await usersService.update(user._id.toString(), { status: ActiveStatus.Inactive });
      const available = await usersService.emailAvailable(updateStatus.email);
      expect(available).toBeFalsy();
    });

    it('when user is deleted than expected response', async () => {
      const updateStatus = await usersService.update(user._id.toString(), { deleted: true });
      const available = await usersService.emailAvailable(updateStatus.email);
      expect(available).toBeTruthy();
    });

    it('when user is deleted and user is banned than expected response', async () => {
      const updateStatus = await usersService.update(user._id.toString(), { deleted: true, userBanned: true });
      const available = await usersService.emailAvailable(updateStatus.email);
      expect(available).toBeFalsy();
    });

    it('when user is banned and status is inactive than expected response', async () => {
      const updateStatus = await usersService.update(user._id.toString(), { status: ActiveStatus.Inactive, userBanned: true });
      const available = await usersService.emailAvailable(updateStatus.email);
      expect(available).toBeFalsy();
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
          user.id,
          user.verification_token,
        ),
      ).toBe(true);
    });

    it('returns false when userId does not exist', async () => {
      const nonExistentId = new Types.ObjectId().toString();
      expect(
        await usersService.verificationTokenIsValid(
          nonExistentId,
          user.verification_token,
        ),
      ).toBe(false);
    });

    it('returns false when userId is not a MongoID and does not exist', async () => {
      const nonExistentId = 'zzz';
      expect(
        await usersService.verificationTokenIsValid(
          nonExistentId,
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

    it('when verification_token or email do not exist', async () => {
      const userVerificationToken = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
      const nonExistentId = new Types.ObjectId().toString();
      expect(
        await usersService.verificationTokenIsValid(
          nonExistentId,
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
      const reloadedUser = await usersService.findById(updatedUser.id, true);
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
      excludedUserIds = await blocksService.getUserIdsForBlocksToOrFromUser(user0.id);
      excludedUserIds.push(user0._id);
    });
    it('when query exists, returns expected response, with orders sorted alphabetically by username', async () => {
      const query = 'Te';
      const limit = 5;
      const suggestUserNames = await usersService.suggestUserName(query, limit, true, excludedUserIds);
      expect(suggestUserNames).toEqual([
        pick(await usersService.findByUsername('test1', true), ['userName', 'id', 'profilePic']),
        pick(await usersService.findByUsername('test2', true), ['userName', 'id', 'profilePic']),
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

  describe('#addAndUpdateNewConversationId', () => {
    it('finds the expected user and update newConversationIds', async () => {
      const user1 = await usersService.create(userFactory.build());
      const user2 = await usersService.create(userFactory.build());
      const matchList = await chatService.createPrivateDirectMessageConversation(
        [new mongoose.Types.ObjectId(user1.id), new mongoose.Types.ObjectId(user2.id)],
      );

      const userData = await usersService.addAndUpdateNewConversationId(user1.id, matchList.id);
      expect(userData.newConversationIds).toEqual([matchList.id]);
    });
  });

  describe('#updateNewFriendRequestCount', () => {
    it('finds the expected user and update newFriendRequestCount', async () => {
      const user = await usersService.create(userFactory.build());
      const userData = await usersService.updateNewFriendRequestCount(user.id);
      expect(userData.newFriendRequestCount).toBe(1);
    });
  });

  describe('#clearNotificationCount', () => {
    it('finds the expected user and update newNotificationCount', async () => {
      const user = await usersService.create(userFactory.build());
      const userData = await usersService.clearNotificationCount(user.id);
      expect(userData.newNotificationCount).toBe(0);
    });
  });

  describe('#clearFriendRequestCount', () => {
    it('finds the expected user and update newFriendRequestCount', async () => {
      const user = await usersService.create(userFactory.build());
      const userData = await usersService.clearFriendRequestCount(user.id);
      expect(userData.newFriendRequestCount).toBe(0);
    });
  });

  describe('#addAndUpdateNewConversationIdByMatchId', () => {
    it('finds the expected user and addAndUpdateNewConversationIdByMatchId', async () => {
      const user1 = await usersService.create(userFactory.build());
      const user2 = await usersService.create(userFactory.build());
      const matchList = await chatService.createPrivateDirectMessageConversation(
        [new mongoose.Types.ObjectId(user1.id), new mongoose.Types.ObjectId(user2.id)],
      );
      const user3 = await usersService.create(userFactory.build({
        newConversationIds: [matchList.id],
      }));

      const userData = await usersService.removeAndUpdateNewConversationId(user3.id, matchList.id);
      expect(userData.newConversationIds).toEqual([]);
    });
  });

  describe('#clearConverstionIdsCount', () => {
    it('finds the expected user and update converstionIdsCount', async () => {
      const user = await usersService.create(userFactory.build());
      const userData = await usersService.clearConverstionIds(user.id);
      expect(userData.newConversationIds).toEqual([]);
    });
  });

  describe('#findOneAndUpdateDeviceToken', () => {
    const deviceAndAppVersionPlaceholderSignInFields = {
      device_id: 'sample-device-id',
      device_token: 'sample-device-token',
      device_type: 'sample-device-type',
      device_version: 'sample-device-version',
      app_version: 'sample-app-version',
    };
    let user: UserDocument;
    beforeEach(async () => {
      const userDevices = [];
      for (let i = 1; i <= 2; i += 1) {
        const weekAgo = DateTime.now().minus({ days: i }).toISODate();
        userDevices.push(
          {
            ...deviceAndAppVersionPlaceholderSignInFields,
            device_id: `${i}`,
            login_date: weekAgo,
          },
        );
      }
      const userData = userFactory.build();
      userData.userDevices = userDevices;
      user = await usersService.create(userData);
    });

    it('finds the expected user and update device token', async () => {
      const userData = await usersService.findOneAndUpdateDeviceToken(user.id, '1', 'new-device-token');
      expect(userData.userDevices[0].device_token).toBe('new-device-token');
    });

    it('when device id is not exist than expected response', async () => {
      const userData = await usersService.findOneAndUpdateDeviceToken(user.id, '3', 'new-device-token');
      expect(userData).toBeNull();
    });
  });

  describe('#ignoreFriendSuggestionDialog', () => {
    it('successfully updates ignoreFriendSuggestionDialog key', async () => {
      const user = await usersService.create(userFactory.build());
      await usersService.ignoreFriendSuggestionDialog(user.id);
      const updateUser = await usersService.findById(user.id, true);
      expect(user.ignoreFriendSuggestionDialog).toBe(false);
      //after update
      expect(updateUser.ignoreFriendSuggestionDialog).toBe(true);
    });
  });

  describe('#delete', () => {
    let user;
    let user1;
    let user2;
    beforeEach(async () => {
      user = await usersService.create(userFactory.build());
      user1 = await usersService.create(userFactory.build());
      user2 = await usersService.create(userFactory.build());
      await friendsService.createFriendRequest(user.id, user1._id.toString());
      await friendsService.createFriendRequest(user1._id.toString(), user.id);
      await friendsService.createFriendRequest(user.id, user2._id.toString());
      await blocksModel.create({
        from: user.id,
        to: user1._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      await blocksModel.create({
        from: user.id,
        to: user2._id,
        reaction: BlockAndUnblockReaction.Block,
      });
      await blocksModel.create({
        from: user1._id,
        to: user.id,
        reaction: BlockAndUnblockReaction.Block,
      });
      await suggestBlocksModel.create({
        from: user.id,
        to: user1._id,
        reaction: SuggestBlockReaction.Block,
      });
      await suggestBlocksModel.create({
        from: user1._id,
        to: user.id,
        reaction: SuggestBlockReaction.Block,
      });
    });
    it('marks the user as deleted and performs the expected associted deletion actions', async () => {
      const originalHashedPassword = user.password;
      await usersService.delete(user.id);

      const userData = await usersService.findById(user.id, false);
      expect(userData.deleted).toBe(true); // expect user to be marked as deleted
      expect(userData.password).not.toEqual(originalHashedPassword); // expect password change

      const fromOrToQuery = {
        $or: [
          { from: user.id },
          { to: user.id },
        ],
      };
      const friends = await friendsModel.find(fromOrToQuery);
      const blocks = await blocksModel.find(fromOrToQuery);
      const suggestBlocks = await suggestBlocksModel.find(fromOrToQuery);

      expect(friends).toHaveLength(0); // expect friendships to be deleted
      expect(blocks).toHaveLength(0); // expect blocks to be deleted
      expect(suggestBlocks).toHaveLength(0); // expect suggest blocks to be deleted
    });
  });
});
