import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose, { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { userFactory } from '../../../../factories/user.factory';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { FriendsService } from '../../../../../src/friends/providers/friends.service';
import { Friend, FriendDocument } from '../../../../../src/schemas/friend/friend.schema';
import { FriendRequestReaction } from '../../../../../src/schemas/friend/friend.enums';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { BlockAndUnblock, BlockAndUnblockDocument } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../../../../src/schemas/blockAndUnblock/blockAndUnblock.enums';
import { ProfileVisibility } from '../../../../../src/schemas/user/user.enums';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';

describe('Get All Friends (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
  let user3: UserDocument;
  let user4: UserDocument;
  let user5: UserDocument;
  let configService: ConfigService;
  let friendsService: FriendsService;
  let friendsModel: Model<FriendDocument>;
  let blocksModel: Model<BlockAndUnblockDocument>;

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

    activeUser = await usersService.create(userFactory.build({ userName: 'Star Wars Fan' }));
    user1 = await usersService.create(userFactory.build({ userName: 'Albert DARTH Skywalker' }));
    user2 = await usersService.create(userFactory.build({ userName: 'Abe Kenobi' }));
    user3 = await usersService.create(userFactory.build({ userName: 'Darth Vader' }));
    user4 = await usersService.create(userFactory.build({ userName: 'Princess Leia' }));
    user5 = await usersService.create(userFactory.build({ userName: 'Darth Maul' }));
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    const usersToAddAsAcceptedFriends = [
      [activeUser, user1],
      [user2, activeUser],
      [activeUser, user3],
      [activeUser, user5],
      [user3, user2],
      [user3, user4],
    ];
    for (const [from, to] of usersToAddAsAcceptedFriends) {
      await friendsService.createFriendRequest(from.id, to.id);
      await friendsService.acceptFriendRequest(from.id, to.id);
    }
  });

  describe('GET /api/v1/users/:userId/friends', () => {
    it('requires authentication', async () => {
      const userId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).get(`/api/v1/users/${userId}/friends`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Get all friends for the given currently active user, ordered by username', () => {
      beforeEach(async () => {
        await friendsModel.updateMany({}, { $set: { reaction: FriendRequestReaction.Accepted } }, { multi: true });
      });
      it('finds all friends', async () => {
        const limit = 5;
        const offset = 0;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/friends?limit=${limit}&offset=${offset}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          allFriendCount: 4,
          friends: [
            {
              _id: user2._id.toString(),
              userName: 'Abe Kenobi',
              firstName: 'First name 3',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            },
            {
              _id: user1._id.toString(),
              userName: 'Albert DARTH Skywalker',
              firstName: 'First name 2',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            },
            {
              _id: user5._id.toString(),
              userName: 'Darth Maul',
              firstName: 'First name 6',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            },
            {
              _id: user3._id.toString(),
              userName: 'Darth Vader',
              firstName: 'First name 4',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            },
          ],
        });
      });

      it('when applying limt and offset, and filtering on userName, returns the expected response', async () => {
        const limit = 1;
        const offset = 1;
        const userNameContains = 'darth';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/friends?limit=${limit}&offset=${offset}&userNameContains=${userNameContains}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          allFriendCount: 4,
          friends: [
            {
              _id: user3._id.toString(),
              userName: 'Darth Vader',
              firstName: 'First name 4',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            },
          ],
        });
      });
    });

    describe('Get all username-ordered friend data for a user who is not the currently active user', () => {
      beforeEach(async () => {
        await friendsModel.updateMany({}, { $set: { reaction: FriendRequestReaction.Accepted } }, { multi: true });
      });
      it('find all friend', async () => {
        const limit = 5;
        const offset = 0;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${user3.id}/friends?limit=${limit}&offset=${offset}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          allFriendCount: 3,
          friends: [
            {
              _id: user2._id.toString(),
              userName: 'Abe Kenobi',
              firstName: 'First name 3',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            },
            {
              _id: user4._id.toString(),
              userName: 'Princess Leia',
              firstName: 'First name 5',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            },
            {
              _id: activeUser.id,
              userName: 'Star Wars Fan',
              firstName: 'First name 1',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            },
          ],
        });
      });

      it('find all friend when filtering by username', async () => {
        const limit = 5;
        const offset = 0;
        const userNameContains = 'abe';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${user3.id}/friends?limit=${limit}&offset=${offset}&userNameContains=${userNameContains}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          allFriendCount: 3,
          friends: [
            {
              _id: user2._id.toString(),
              userName: 'Abe Kenobi',
              firstName: 'First name 3',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            },
          ],
        });
      });
      it('when user is block than expected response.', async () => {
        await blocksModel.create({
          from: activeUser.id,
          to: user1._id,
          reaction: BlockAndUnblockReaction.Block,
        });
        const limit = 3;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${user1._id}/friends?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          message: 'User not found',
          statusCode: 404,
        });
      });
    });

    it('denies access when requesting friends for a non-friend user with a non-public profile', async () => {
      const user6 = await usersService.create(userFactory.build({ profile_status: ProfileVisibility.Private }));
      const user7 = await usersService.create(userFactory.build({ profile_status: ProfileVisibility.Private }));
      await friendsService.createFriendRequest(user6.id, user7.id);
      const limit = 10;
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${user6._id}/friends?limit=${limit}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send()
        .expect(HttpStatus.FORBIDDEN);
      expect(response.body.message).toContain('You must be friends with this user to perform this action.');
    });

    describe('Validation', () => {
      it('userId must be a mongodb id', async () => {
        const userId = 'not-a-mongo-id';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${userId}/friends?limit=10`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId must be a mongodb id',
        );
      });

      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/friends`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/friends?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 40', async () => {
        const limit = 41;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/friends?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 40');
      });

      it('offset should be a number', async () => {
        const limit = 10;
        const offset = 'a';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/friends?limit=${limit}&offset=${offset}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('offset must be a number conforming to the specified constraints');
      });

      it('usern name be shorter than or equal to 30 characters', async () => {
        const limit = 10;
        const offset = 1;
        const userNameContains = new Array(35).join('z');
        const response = await request(app.getHttpServer())
          .get(`/api/v1/users/${activeUser.id}/friends?limit=${limit}&offset=${offset}&userNameContains=${userNameContains}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('userNameContains must be shorter than or equal to 30 characters');
      });
    });
  });
});
