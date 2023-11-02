/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { FriendsService } from './friends.service';
import { UsersService } from '../../users/providers/users.service';
import { UserDocument } from '../../schemas/user/user.schema';
import { userFactory } from '../../../test/factories/user.factory';
import { FriendRequestReaction } from '../../schemas/friend/friend.enums';
import { Friend, FriendDocument } from '../../schemas/friend/friend.schema';
import { SuggestBlock, SuggestBlockDocument } from '../../schemas/suggestBlock/suggestBlock.schema';
import { SuggestBlockReaction } from '../../schemas/suggestBlock/suggestBlock.enums';
import { BlocksService } from '../../blocks/providers/blocks.service';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { ActiveStatus } from '../../schemas/user/user.enums';

describe('FriendsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let friendsService: FriendsService;
  let usersService: UsersService;
  let user0: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
  let user3: UserDocument;
  let friendsModel: Model<FriendDocument>;
  let suggestBlockModel: Model<SuggestBlockDocument>;
  let blocksService: BlocksService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    blocksService = moduleRef.get<BlocksService>(BlocksService);
    usersService = moduleRef.get<UsersService>(UsersService);
    friendsModel = moduleRef.get<Model<FriendDocument>>(getModelToken(Friend.name));
    suggestBlockModel = moduleRef.get<Model<SuggestBlockDocument>>(getModelToken(SuggestBlock.name));
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

    user0 = await usersService.create(userFactory.build({ userName: 'Hannibal' }));
    user1 = await usersService.create(userFactory.build({ userName: 'Michael' }));
    user2 = await usersService.create(userFactory.build({ userName: 'Freddy' }));
    user3 = await usersService.create(userFactory.build({ userName: 'Count Orlok' }));
  });

  it('should be defined', () => {
    expect(friendsService).toBeDefined();
  });

  describe('#findFriendship', () => {
    beforeEach(async () => {
      await friendsService.createFriendRequest(user0.id, user1.id);
    });

    it('returns the expected friend info for two users with a pending friend record', async () => {
      expect(
        await friendsService.findFriendship(user0.id, user1.id),
      ).toMatchObject({
        reaction: FriendRequestReaction.Pending,
        from: user0._id,
        to: user1._id,
      });
    });

    it('returns the expected friend info for two users with an accepted friend record', async () => {
      await friendsService.acceptFriendRequest(user0.id, user1.id);
      expect(
        await friendsService.findFriendship(user0.id, user1.id),
      ).toMatchObject({
        reaction: FriendRequestReaction.Accepted,
        from: user0._id,
        to: user1._id,
      });
    });

    it('returns the expected friend info for two users with a declined/cancelled friend record', async () => {
      await friendsService.cancelFriendshipOrDeclineRequest(user0.id, user1.id);
      expect(
        await friendsService.findFriendship(user0.id, user1.id),
      ).toMatchObject({
        reaction: FriendRequestReaction.DeclinedOrCancelled,
        from: user0._id,
        to: user1._id,
      });
    });

    it('for two users with NO friend record, returns null', async () => {
      expect(
        await friendsService.findFriendship(user0.id, user2.id),
      ).toBeNull();
    });
  });

  describe('#findFriendshipBulk', () => {
    beforeEach(async () => {
      // create a pending friend request for `user1`
      await friendsService.createFriendRequest(user0.id, user1.id);
      // accept friend request for `user2`
      await friendsService.createFriendRequest(user2.id, user0.id);
      await friendsService.acceptFriendRequest(user2.id, user0.id);
    });

    it('returns the expected friend records for `requestingContextUserId` associated with given array of `userIds`', async () => {
      const requestingContextUserId = user0.id;
      const users = [user1._id, user2.id, user3.id];
      const bulkFriendRecords = await friendsService.findFriendshipBulk(requestingContextUserId, users);
      // NOTE: There is no friend request record for `user3` and thus not record should be returned
      expect(bulkFriendRecords).toMatchObject({
        [user1.id]: {
          reaction: FriendRequestReaction.Pending,
          from: user0._id,
          to: user1._id,
        },
        [user2.id]: {
          reaction: FriendRequestReaction.Accepted,
          from: user2._id,
          to: user0._id,
        },
      });
    });
  });

  describe('#areFriends', () => {
    let newUser1;
    let newUser2;
    beforeEach(async () => {
      newUser1 = await usersService.create(userFactory.build());
      newUser2 = await usersService.create(userFactory.build());
    });
    it('returns true when two users are accepted friends', async () => {
      await friendsService.createFriendRequest(newUser1.id, newUser2.id);
      await friendsService.acceptFriendRequest(newUser1.id, newUser2.id);
      expect(
        await friendsService.areFriends(newUser1.id, newUser2.id),
      ).toBeTruthy();
    });

    it('returns false when two users are not friends', async () => {
      expect(
        await friendsService.areFriends(newUser1.id, newUser2.id),
      ).toBeFalsy();
    });

    it('returns false when a friend request has been sent, but has not been accepted', async () => {
      await friendsService.createFriendRequest(newUser1.id, newUser2.id);
      expect(
        await friendsService.areFriends(newUser1.id, newUser2.id),
      ).toBeFalsy();
    });
  });

  describe('#createFriendRequest', () => {
    let newUser1;
    let newUser2;
    beforeEach(async () => {
      newUser1 = await usersService.create(userFactory.build());
      newUser2 = await usersService.create(userFactory.build());
    });
    it('creates the expected friend record and sets friend.reaction to pending by default', async () => {
      await friendsService.createFriendRequest(newUser1.id, newUser2.id);
      expect(
        (await friendsService.findFriendship(newUser1.id, newUser2.id)).reaction,
      ).toEqual(FriendRequestReaction.Pending);
    });

    it('when friend request is decline than expected response', async () => {
      const friends = await friendsModel.create({
        from: newUser1.id,
        to: newUser2.id,
        reaction: FriendRequestReaction.DeclinedOrCancelled,
      });
      await friendsService.createFriendRequest(newUser1.id, newUser2.id);
      const friendData = await friendsModel.findOne({ _id: friends._id });
      expect(friendData).toBeNull();
    });

    it('when friend request is pending than expected response', async () => {
      await friendsModel.create({
        from: newUser1.id,
        to: newUser2.id,
        reaction: FriendRequestReaction.Pending,
      });
      await friendsService.createFriendRequest(newUser2.id, newUser1.id);
      expect((await friendsService.findFriendship(newUser2.id, newUser1.id)).reaction).toEqual(FriendRequestReaction.Accepted);
    });
  });

  describe('#getSentFriendRequests', () => {
    beforeEach(async () => {
      await friendsService.createFriendRequest(user0.id, user2.id);
      await friendsService.createFriendRequest(user0.id, user3.id);
    });
    it('finds the expected number of friend records representing friend requests', async () => {
      expect(
        await friendsService.getSentFriendRequests(user0.id, 5, 0),
      ).toHaveLength(2);
    });

    it('returns the expected response for applied limit and offset', async () => {
      expect(
        await friendsService.getSentFriendRequests(user0.id, 1, 1),
      ).toHaveLength(1);
    });

    it('when userId is the receiver of a request, but has no sent requests', async () => {
      expect(await friendsService.getSentFriendRequests(user2.id, 5, 1)).toEqual([]);
    });
  });

  describe('#getReceivedFriendRequests', () => {
    beforeEach(async () => {
      await friendsService.createFriendRequest(user2.id, user0.id);
      await friendsService.createFriendRequest(user3.id, user0.id);
    });

    it('finds the expected number of friend records representing friend requests', async () => {
      expect(
        await friendsService.getReceivedFriendRequests(user0.id, 5, 0),
      ).toHaveLength(2);
    });

    it('returns the expected response for applied limit and offset', async () => {
      expect(
        await friendsService.getReceivedFriendRequests(user0.id, 1, 1),
      ).toHaveLength(1);
    });

    it('when userId is the sender of a request, but has no received requests', async () => {
      expect(await friendsService.getReceivedFriendRequests(user2.id, 5, 1)).toEqual([]);
    });
  });

  describe('#cancelFriendshipOrDeclineRequest', () => {
    describe('when request is pending', () => {
      beforeEach(async () => {
        await friendsService.createFriendRequest(user0.id, user2.id);
        await friendsService.cancelFriendshipOrDeclineRequest(user0.id, user2.id);
      });

      it('updates the status of the friend record to: declined', async () => {
        expect(
          (await friendsService.findFriendship(user0.id, user2.id)).reaction,
        ).toEqual(FriendRequestReaction.DeclinedOrCancelled);
      });
    });

    describe('when request has already been accepted', () => {
      beforeEach(async () => {
        await friendsService.createFriendRequest(user0.id, user2.id);
        await friendsService.acceptFriendRequest(user0.id, user2.id);
        await friendsService.cancelFriendshipOrDeclineRequest(user0.id, user2.id);
      });

      it('updates the status of the friend record to: declined', async () => {
        expect(
          (await friendsService.findFriendship(user0.id, user2.id)).reaction,
        ).toEqual(FriendRequestReaction.DeclinedOrCancelled);
      });
    });
  });

  describe('#getFriendIds', () => {
    let user4;
    beforeEach(async () => {
      user4 = await usersService.create(userFactory.build({ userName: 'Horror' }));
    });

    it('returns the expected response with accepted status', async () => {
      await friendsService.createFriendRequest(user1.id, user2.id);
      await friendsService.createFriendRequest(user1.id, user3.id);
      await friendsService.acceptFriendRequest(user1.id, user2.id);
      await friendsService.acceptFriendRequest(user1.id, user3.id);
      const friend = await friendsService.getFriendIds(user1.id, [FriendRequestReaction.Accepted]);
      expect(friend).toEqual([user2._id, user3._id]);
    });

    it('returns the expected response with pending status', async () => {
      await friendsService.createFriendRequest(user1.id, user4.id);
      const friend = await friendsService.getFriendIds(user1.id, [FriendRequestReaction.Pending]);
      expect(friend).toEqual([user4._id]);
    });

    it('returns the expected response with decline status', async () => {
      await friendsService.createFriendRequest(user1.id, user4.id);
      await friendsService.cancelFriendshipOrDeclineRequest(user1.id, user4.id);
      const friend = await friendsService.getFriendIds(user1.id, [FriendRequestReaction.DeclinedOrCancelled]);
      expect(friend).toEqual([user4._id]);
    });
  });

  describe('#getActiveFriendCount', () => {
    let user4;
    beforeEach(async () => {
      user4 = await usersService.create(userFactory.build({ userName: 'Horror' }));
    });

    it('returns the expected response with accepted status', async () => {
      // Create two friend requests and accept them
      await friendsService.createFriendRequest(user1.id, user2.id);
      await friendsService.createFriendRequest(user1.id, user3.id);
      await friendsService.acceptFriendRequest(user1.id, user2.id);
      await friendsService.acceptFriendRequest(user1.id, user3.id);
      // Create one pending friend request
      await friendsService.createFriendRequest(user1.id, user4.id);
      // Friends count should not include pending requests
      const friendsCount = await friendsService.getActiveFriendCount(user1.id, [FriendRequestReaction.Accepted]);
      expect(friendsCount).toBe(2);
    });
  });

  describe('#getFriends', () => {
    beforeEach(async () => {
      const user4 = await usersService.create(userFactory.build({ userName: 'Count Dracula' }));
      const user5 = await usersService.create(userFactory.build({ userName: 'The Count' }));

      const usersToAddAsAcceptedFriends = [
        [user0, user1], // friends with "Michael"
        [user0, user3], // friends with "Count Orlok"
        [user4, user0], // friends with "Count Dracula"
        [user5, user0], // friends with "The Count"
      ];
      for (const [from, to] of usersToAddAsAcceptedFriends) {
        await friendsService.createFriendRequest(from.id, to.id);
        await friendsService.acceptFriendRequest(from.id, to.id);
      }
    });

    it('returns the expected friends and total, with friends sorted in alphabetical order by username', async () => {
      const { friends, allFriendCount } = await friendsService.getFriends(user0.id, 10, 0);
      expect(allFriendCount).toBe(4);
      expect(friends.map((friend) => friend.userName)).toEqual(
        [
          'Count Dracula',
          'Count Orlok',
          'Michael',
          'The Count',
        ],
      );
    });

    it('returns the expected response for applied limit and offset', async () => {
      const { friends, allFriendCount } = await friendsService.getFriends(user0.id, 3, 3);
      expect(allFriendCount).toBe(4);
      expect(friends.map((friend) => friend.userName)).toEqual(
        [
          'The Count',
        ],
      );
    });

    it('returns the expected response when doing case-insensitive filtering on a userName', async () => {
      const { friends, allFriendCount } = await friendsService.getFriends(user0.id, 5, 0, 'count');
      expect(allFriendCount).toBe(4);
      expect(friends.map((friend) => friend.userName)).toEqual(
        [
          'Count Dracula',
          'Count Orlok',
        ],
      );
    });

    it('returns no results when there are no case-insensitive matches on a userName', async () => {
      const { friends, allFriendCount } = await friendsService.getFriends(user0.id, 5, 0, 'zzzzzz');
      expect(allFriendCount).toBe(4);
      expect(friends).toHaveLength(0);
    });

    it('when applying limit, offset, and userName filter', async () => {
      const { friends, allFriendCount } = await friendsService.getFriends(user0.id, 5, 1, 'count');
      expect(allFriendCount).toBe(4);

      expect(friends.map((friend) => friend.userName)).toEqual(
        [
          'Count Orlok',
        ],
      );
    });
  });

  describe('#getSuggestedFriends', () => {
    let user;
    let user4;
    let user5;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build(),
      );
      user4 = await usersService.create(
        userFactory.build(),
      );
      user5 = await usersService.create(
        userFactory.build(),
      );
      for (let i = 0; i < 7; i += 1) {
        await usersService.create(
          userFactory.build(),
        );
      }

      await friendsService.createFriendRequest(user._id.toString(), user1._id.toString());
      await friendsService.createFriendRequest(user2._id.toString(), user._id.toString());
      await friendsService.createFriendRequest(user3._id.toString(), user._id.toString());

      await friendsService.acceptFriendRequest(user._id.toString(), user1._id.toString());
      await friendsService.acceptFriendRequest(user2._id.toString(), user._id.toString());

      // create suggest block user
      await friendsService.createSuggestBlock(user._id.toString(), user4._id.toString());
      await blocksService.createBlock(user._id.toString(), user5._id.toString());
    });

    it('finds the expected number of users when the requested number is higher than the number available, '
      + 'and does not incude passed-in user among the set', async () => {
        const suggestedFriends = await friendsService.getSuggestedFriends(user, 14); // ask for up to 14 users
        expect(suggestedFriends).toHaveLength(8); // 11 other users in the system, but 2 are friends and 1 is pending
        expect(suggestedFriends.map((friend) => friend._id)).not.toContain(user._id);
        expect(suggestedFriends.map((friend) => friend._id)).not.toContain(user4._id);
        expect(suggestedFriends.map((friend) => friend._id)).not.toContain(user5._id);
      });

    it('returns the expected number of users when the requested number equals the number available', async () => {
      const suggestedFriends = await friendsService.getSuggestedFriends(user, 8);
      expect(suggestedFriends).toHaveLength(8);
    });

    it('returns the expected number of users when the requested number is lower than the number available', async () => {
      const suggestedFriends = await friendsService.getSuggestedFriends(user, 5);
      expect(suggestedFriends).toHaveLength(5);
    });

    it('when user status is inactive than expected response', async () => {
      const user6 = await usersService.create(
        userFactory.build({
          status: ActiveStatus.Inactive,
        }),
      );
      const suggestedFriends = await friendsService.getSuggestedFriends(user, 10);
      expect(suggestedFriends).toHaveLength(8);
      expect(suggestedFriends.map((friend) => friend._id)).not.toContain(user6._id);
    });

    it('when user is deleted than expected response', async () => {
      const user7 = await usersService.create(
        userFactory.build(),
      );
      await usersService.update(user7.id, { deleted: true });
      const suggestedFriends = await friendsService.getSuggestedFriends(user, 10);
      expect(suggestedFriends).toHaveLength(8);
      expect(suggestedFriends.map((friend) => friend._id)).not.toContain(user7._id);
    });

    it('when user is banned than expected response', async () => {
      const user8 = await usersService.create(
        userFactory.build(),
      );
      await usersService.update(user8.id, { userBanned: true });
      const suggestedFriends = await friendsService.getSuggestedFriends(user, 10);
      expect(suggestedFriends).toHaveLength(8);
      expect(suggestedFriends.map((friend) => friend._id)).not.toContain(user8._id);
    });
  });

  describe('#acceptFriendRequest', () => {
    beforeEach(async () => {
      await friendsService.createFriendRequest(user0.id, user1.id);
    });

    it('updates the friend request record to have the Accepted reaction', async () => {
      await friendsService.acceptFriendRequest(user0.id, user1.id);
      expect(
        (await friendsService.findFriendship(user0.id, user1.id)).reaction,
      ).toEqual(FriendRequestReaction.Accepted);
    });

    it('only allows the receiver to accept the request, NOT the sender', async () => {
      await expect(friendsService.acceptFriendRequest(user1.id, user0.id)).rejects.toThrow('No pending friend request');
    });

    it('returns the expected response for two user who have no friend request between them', async () => {
      await expect(friendsService.acceptFriendRequest(user1.id, user2.id)).rejects.toThrow('No pending friend request');
    });
  });

  describe('#getReceivedFriendRequestCount', () => {
    beforeEach(async () => {
      await friendsService.createFriendRequest(user2.id, user0.id);
      await friendsService.createFriendRequest(user3.id, user0.id);
    });

    it('finds the expected number of friend records representing friend request count', async () => {
      expect(
        await friendsService.getReceivedFriendRequestCount(user0.id),
      ).toBe(2);
    });

    it('when userId has no any received requests', async () => {
      expect(await friendsService.getReceivedFriendRequestCount(user2.id)).toBe(0);
    });
  });

  describe('#blockFriendSuggestion', () => {
    it('create block reaction for passed usrIds', async () => {
      const fromAndTo = {
        from: user0.id,
        to: user1.id,
      };
      const suggestBlockNoData = await suggestBlockModel.findOne(fromAndTo);
      expect(suggestBlockNoData).toBeNull();

      await friendsService.createSuggestBlock(user0.id, user1.id);
      const suggestBlockData = await suggestBlockModel.findOne(fromAndTo);
      expect(suggestBlockData.reaction).toBe(SuggestBlockReaction.Block);
    });

    it('already created unblock reaction for passed userIds', async () => {
      const newSuggestBlockData = await suggestBlockModel.create({
        from: user1.id,
        to: user2.id,
        reaction: SuggestBlockReaction.Unblock,
      });

      await friendsService.createSuggestBlock(user1.id, user2.id);

      const suggestBlockData = await suggestBlockModel.findById(newSuggestBlockData.id);
      expect(suggestBlockData.reaction).toBe(SuggestBlockReaction.Block);
    });

    it('already created block reaction for passed userIds', async () => {
      await suggestBlockModel.create({
        from: user0.id,
        to: user2.id,
        reaction: SuggestBlockReaction.Block,
      });

      await friendsService.createSuggestBlock(user0.id, user2.id);

      const fromAndTo = {
        from: user0.id,
        to: user2.id,
      };
      const suggestBlockData = await suggestBlockModel.find(fromAndTo);
      expect(suggestBlockData).toHaveLength(1);
    });
  });

  describe('#getSuggestBlockedUserIdsBySender', () => {
    beforeEach(async () => {
      await friendsService.createSuggestBlock(user0.id, user1.id);
      await friendsService.createSuggestBlock(user0.id, user2.id);
    });

    it('get userIds of that pass user has created block entry for those', async () => {
      const suggestBlockUserIdList = await friendsService.getSuggestBlockedUserIdsBySender(user0.id);
      expect(suggestBlockUserIdList.map((suggestBlockUserId) => suggestBlockUserId.toString())).toEqual([
        user1.id,
        user2.id,
      ]);
    });
  });

  describe('#deleteAllFriendRequest', () => {
    beforeEach(async () => {
      // Pending friend request
      await friendsService.createFriendRequest(user2.id, user0.id);

      // Accepted friend
      await friendsService.createFriendRequest(user3.id, user0.id);
      await friendsService.acceptFriendRequest(user3.id, user0.id);

      // Declined friend
      await friendsService.cancelFriendshipOrDeclineRequest(user0.id, user1.id);
    });

    it('delete the friend request data successful of passed userId', async () => {
      await friendsService.deleteAllByUserId(user0.id);
      expect(
        await friendsModel.find({
          $or: [
            { from: user0.id },
            { to: user0.id },
          ],
        })
          .exec(),
      ).toHaveLength(0);
    });
  });

  describe('#deleteAllSuggestBlocksByUserId', () => {
    beforeEach(async () => {
      await friendsService.createFriendRequest(user0.id, user1.id);
      await friendsService.createFriendRequest(user0.id, user2.id);
      await friendsService.createFriendRequest(user0.id, user3.id);
      await friendsService.createFriendRequest(user1.id, user0.id);
    });
    it('deletes all friend request data successful of passed userId', async () => {
      await friendsService.deleteAllSuggestBlocksByUserId(user0.id);
      expect(await suggestBlockModel.find({
        $or: [
          { from: user0.id },
          { to: user0.id },
        ],
      })).toHaveLength(0);
    });
  });

  describe('#deleteAllByUserId', () => {
    beforeEach(async () => {
      await friendsService.createFriendRequest(user0.id, user1.id);
      await friendsService.acceptFriendRequest(user0.id, user1.id);
      await friendsService.createFriendRequest(user0.id, user2.id);
      await friendsService.createFriendRequest(user0.id, user3.id);
      await friendsService.createFriendRequest(user1.id, user2.id);
    });
    it('deleted all friend data successfully of passed userId', async () => {
      await friendsService.deleteAllByUserId(user0.id);
      expect(await friendsModel.find({
        $or: [
          { from: user0.id },
          { to: user0.id },
        ],
      }).exec()).toHaveLength(0);
    });
  });
});
