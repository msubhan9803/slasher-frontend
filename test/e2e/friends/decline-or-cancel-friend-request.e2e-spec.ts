import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { userFactory } from '../../factories/user.factory';
import { UsersService } from '../../../src/users/providers/users.service';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { FriendsService } from '../../../src/friends/providers/friends.service';
import { Friend, FriendDocument } from '../../../src/schemas/friend/friend.schema';
import { FriendRequestReaction } from '../../../src/schemas/friend/friend.enums';

describe('Decline Or Cancel Friend Request (e2e)', () => {
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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
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
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    await friendsService.createFriendRequest(activeUser._id.toString(), user1._id.toString());
    await friendsService.createFriendRequest(user1._id.toString(), activeUser._id.toString());
    await friendsService.createFriendRequest(activeUser._id.toString(), user2._id.toString());
  });

  describe('Delete /friends', () => {
    describe('Decline or cancel friend request', () => {
      it('when friend request is decline or cancel than expected response', async () => {
        const userId = user1._id;
        await request(app.getHttpServer())
          .delete(`/friends?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        const query = {
          $or: [
            { from: activeUser._id, to: user1._id },
            { from: user1._id, to: activeUser._id },
          ],
        };
        const friends = await friendsModel.find(query);
        for (let i = 1; i < friends.length; i += 1) {
          expect(friends[i].reaction).toEqual(FriendRequestReaction.DeclinedOrCancelled);
        }
      });
    });

    describe('Validation', () => {
      it('userId should not be empty', async () => {
        const userId = '';
        const response = await request(app.getHttpServer())
          .delete(`/friends?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId should not be empty',
        );
      });

      it('userId must match /^[a-f\\d]{24}$/i regular expression', async () => {
        const userId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .delete(`/friends?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId must match /^[a-f\\d]{24}$/i regular expression',
        );
      });
    });
  });
});
