import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from '../../app.module';
import { FriendsService } from './friends.service';
import { UsersService } from '../../users/providers/users.service';
import { User } from '../../../src/schemas/user/user.schema';
import { Friend } from '../../../src/schemas/friend/friend.schema';
import { userFactory } from '../../../test/factories/user.factory';

describe('FriendsService', () => {
  let app: INestApplication;
  let connection: Connection;
  let friendsService: FriendsService;
  let usersService: UsersService;
  let activeUser: User;
  let userData: User;
  // let activeFriend : Friend;

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
    activeUser = await usersService.create(userFactory.build());
    userData = await usersService.create(userFactory.build());

    await friendsService.createFriendRequest(activeUser._id.toString(), userData._id.toString());
    await friendsService.createFriendRequest(userData._id.toString(), activeUser._id.toString());
  });

  it('should be defined', () => {
    expect(friendsService).toBeDefined();
  });

  describe('#getSentFriendRequests', () => {
    it('finds the expected set of friends', async () => {
      const friends = await friendsService.getSentFriendRequests(activeUser._id.toString(), 5, 0)
      console.log('friends-=-=-=friends', friends);
    });
  });

});
