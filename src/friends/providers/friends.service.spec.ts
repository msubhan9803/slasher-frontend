import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { FriendsService } from './friends.service';
import { UsersService } from '../../users/providers/users.service';
import { UserDocument } from '../../schemas/user/user.schema';
import { userFactory } from '../../../test/factories/user.factory';
import { FriendRequestReaction } from '../../schemas/friend/friend.enums';

describe('FriendsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let friendsService: FriendsService;
  let usersService: UsersService;
  let user0: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
  let user3: UserDocument;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    usersService = moduleRef.get<UsersService>(UsersService);

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
  });

  it('should be defined', () => {
    expect(friendsService).toBeDefined();
  });

  describe('#getFriendRequestReaction', () => {
    beforeEach(async () => {
      await friendsService.createFriendRequest(user0.id, user1.id);
    });

    it('for two users with a friend record, finds the expected friend request reaction details', async () => {
      expect(
        await friendsService.getFriendRequestReaction(user0.id, user1.id),
      ).toBe(FriendRequestReaction.Pending);
    });

    it('for two users with NO friend record, returns null', async () => {
      expect(
        await friendsService.getFriendRequestReaction(user0.id, user2.id),
      ).toBeNull();
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
        await friendsService.getFriendRequestReaction(newUser1.id, newUser2.id),
      ).toEqual(FriendRequestReaction.Pending);
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

  describe('#declineOrCancelFriendRequest', () => {
    describe('when request is pending', () => {
      beforeEach(async () => {
        await friendsService.createFriendRequest(user0.id, user2.id);
        await friendsService.declineOrCancelFriendRequest(user0.id, user2.id);
      });

      it('updates the status of the friend record to: declined', async () => {
        expect(
          await friendsService.getFriendRequestReaction(user0.id, user2.id),
        ).toEqual(FriendRequestReaction.DeclinedOrCancelled);
      });
    });

    describe('when request has already been accepted', () => {
      beforeEach(async () => {
        await friendsService.createFriendRequest(user0.id, user2.id);
        await friendsService.acceptFriendRequest(user0.id, user2.id);
        await friendsService.declineOrCancelFriendRequest(user0.id, user2.id);
      });

      it('updates the status of the friend record to: declined', async () => {
        expect(
          await friendsService.getFriendRequestReaction(user0.id, user2.id),
        ).toEqual(FriendRequestReaction.DeclinedOrCancelled);
      });
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
          'The Count',
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
          'The Count',
        ],
      );
    });
  });

  describe('#getSuggestedFriends', () => {
    let user;
    beforeEach(async () => {
      user = await usersService.create(
        userFactory.build(),
      );
      for (let i = 0; i < 7; i += 1) {
        await usersService.create(
          userFactory.build(),
        );
      }
    });
    it('finds the expected number of users when the requested number is higher than the number available, '
      + 'and does not incude passed-in user among the set', async () => {
        const suggestedFriends = await friendsService.getSuggestedFriends(user, 14); // ask for up to 14 users
        expect(suggestedFriends).toHaveLength(11); // but there should only be 11 returned
        expect(suggestedFriends.map((friend) => friend._id)).not.toContain(user._id);
      });

    it('returns the expected number of users when the requested number equals the number available', async () => {
      const suggestedFriends = await friendsService.getSuggestedFriends(user, 11);
      expect(suggestedFriends).toHaveLength(11);
    });

    it('returns the expected number of users when the requested number is lower than the number available', async () => {
      const suggestedFriends = await friendsService.getSuggestedFriends(user, 5);
      expect(suggestedFriends).toHaveLength(5);
    });
  });

  describe('#acceptFriendRequest', () => {
    beforeEach(async () => {
      await friendsService.createFriendRequest(user0.id, user1.id);
    });

    it('updates the friend request record to have the Accepted reaction', async () => {
      await friendsService.acceptFriendRequest(user0.id, user1.id);
      expect(
        await friendsService.getFriendRequestReaction(user0.id, user1.id),
      ).toEqual(FriendRequestReaction.Accepted);
    });

    it('only allows the receiver to accept the request, NOT the sender', async () => {
      await expect(friendsService.acceptFriendRequest(user1.id, user0.id)).rejects.toThrow('No pending friend request');
    });

    it('returns the expected response for two user who have no friend request between them', async () => {
      await expect(friendsService.acceptFriendRequest(user1.id, user2.id)).rejects.toThrow('No pending friend request');
    });
  });
});
