import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import mongoose, { Connection, Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { FriendsService } from './friends.service';
import { UsersService } from '../../users/providers/users.service';
import { User } from '../../schemas/user/user.schema';
import { Friend, FriendDocument } from '../../schemas/friend/friend.schema';
import { userFactory } from '../../../test/factories/user.factory';
import { FriendRequestReaction } from '../../schemas/friend/friend.enums';

describe('FriendsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let friendsService: FriendsService;
  let usersService: UsersService;
  let activeUser: User;
  let user1: User;
  let user2: User;
  let user3: User;
  let friendsModel: Model<FriendDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    friendsModel = moduleRef.get<Model<FriendDocument>>(getModelToken(Friend.name));

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();
    activeUser = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    user2 = await usersService.create(userFactory.build());
    user3 = await usersService.create(userFactory.build());

    await friendsService.createFriendRequest(activeUser._id.toString(), user1._id.toString());
    await friendsService.createFriendRequest(user1._id.toString(), activeUser._id.toString());
  });

  it('should be defined', () => {
    expect(friendsService).toBeDefined();
  });

  describe('#getFriendRequestReaction', () => {
    it('finds the expected friend request reaction details', async () => {
      const friends = await friendsService.getFriendRequestReaction(activeUser._id.toString(), user1._id.toString());
      expect(friends).toBe(FriendRequestReaction.Pending);
    });

    it('when fromUserId is wrong than expected response', async () => {
      const fromUserId = '633d53908c97974c07aa2e5d';
      const friendsDetails = await friendsService.getFriendRequestReaction(fromUserId, activeUser._id.toString());
      expect(friendsDetails).toBeNull();
    });

    it('when toUserId is wrong than expected response', async () => {
      const toUserId = '633d53908c97974c07aa2e5d';
      const friendsDetails = await friendsService.getFriendRequestReaction(activeUser._id.toString(), toUserId);
      expect(friendsDetails).toBeNull();
    });
  });

  describe('#createFriendRequest', () => {
    let user4; let
      user5;
    beforeEach(async () => {
      user4 = await usersService.create(userFactory.build());
      user5 = await usersService.create(userFactory.build());
    });
    it('finds the expected friend request reaction details', async () => {
      await friendsService.createFriendRequest(user4._id.toString(), user5._id.toString());
      const friendsData = await friendsModel.findOne({
        $and: [{ from: new mongoose.Types.ObjectId(user4._id) }, { to: new mongoose.Types.ObjectId(user5._id) }],
      });
      expect(friendsData.from).toEqual(user4._id);
      expect(friendsData.to).toEqual(user5._id);
    });

    it('when user request is pending than expected response', async () => {
      await friendsService.createFriendRequest(user4._id.toString(), user5._id.toString());
      const friendsData = await friendsModel.findOne({
        $and: [{ from: new mongoose.Types.ObjectId(user4._id) }, { to: new mongoose.Types.ObjectId(user5._id) }],
      });
      expect(friendsData.reaction).toBe(FriendRequestReaction.Pending);
    });

    // TODO: need to check if error throws
  });

  describe('#getSentFriendRequests', () => {
    beforeEach(async () => {
      await friendsService.createFriendRequest(activeUser._id.toString(), user2._id.toString());
      await friendsService.createFriendRequest(activeUser._id.toString(), user3._id.toString());
    });
    it('finds the expected sent friend requests friends', async () => {
      const friends = await friendsService.getSentFriendRequests(activeUser._id.toString(), 5, 1);
      expect(friends[0]._id).not.toEqual(activeUser._id);
    });

    it('when userId is wrong than expected response', async () => {
      const userId = '633d53908c97974c07aa2e5d';
      const friends = await friendsService.getSentFriendRequests(userId, 5, 1);
      expect(friends).toEqual([]);
    });

    it('when apply offset value than expected response', async () => {
      const friends = await friendsService.getSentFriendRequests(activeUser._id.toString(), 1, 2);
      expect(friends).toHaveLength(1);
    });
  });

  describe('#getReceivedFriendRequests', () => {
    beforeEach(async () => {
      await friendsService.createFriendRequest(user2._id.toString(), activeUser._id.toString());
      await friendsService.createFriendRequest(user3._id.toString(), activeUser._id.toString());
    });
    it('finds the expected received friend requests friends', async () => {
      const friends = await friendsService.getReceivedFriendRequests(activeUser._id.toString(), 5, 1);
      expect(friends).toHaveLength(FriendRequestReaction.Accepted);
    });

    it('when userId is wrong than expected response', async () => {
      const userId = '633d53908c97974c07aa2e5d';
      const friends = await friendsService.getReceivedFriendRequests(userId, 5, 1);
      expect(friends).toEqual([]);
    });

    it('when apply offset value than expected response', async () => {
      const friends = await friendsService.getReceivedFriendRequests(activeUser._id.toString(), 1, 2);
      expect(friends).toHaveLength(1);
    });
  });

  describe('#declineOrCancelFriendRequest', () => {
    beforeEach(async () => {
      await friendsService.createFriendRequest(activeUser._id.toString(), user2._id.toString());
      await friendsService.createFriendRequest(activeUser._id.toString(), user3._id.toString());
    });

    it('friend request cancel or decline than expected response', async () => {
      await friendsService.declineOrCancelFriendRequest(activeUser._id.toString(), user2._id.toString());
      const friendsData = await friendsModel.findOne({
        $and: [{ from: activeUser._id }, { to: user2._id }],
      });
      expect(friendsData.reaction).toBe(FriendRequestReaction.DeclinedOrCancelled);
    });
  });

  describe('#getFriends', () => {
    let user7;
    let user6;
    let friendData1;
    let friendData2;
    let updateData;
    beforeEach(async () => {
      user6 = await usersService.create(userFactory.build());
      user7 = await usersService.create(userFactory.build());
      friendData2 = await friendsService.createFriendRequest(user6._id.toString(), user7._id.toString());
      friendData1 = await friendsService.createFriendRequest(user7._id.toString(), user6._id.toString());
      updateData = await friendsModel.updateMany({}, { $set: { reaction: FriendRequestReaction.Accepted } }, { multi: true });
    });

    it('get all friends', async () => {
      const friends = await friendsService.getFriends(user6._id.toString(), 5, 0);
      // const friendsData = await friendsModel.findOne({
      //   $and: [{ from: activeUser._id }, { to: user2._id }],
      // });
      // expect(friendsData.reaction).toBe(FriendRequestReaction.DeclinedOrCancelled);
    });
  });
});
