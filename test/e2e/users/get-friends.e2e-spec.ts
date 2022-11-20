import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
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
import { clearDatabase } from '../../helpers/mongo-helpers';

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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
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
    await clearDatabase(connection);
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

  describe('Get /users/:userId/friends', () => {
    describe('Get all friends for the given currently active user, ordered by username', () => {
      beforeEach(async () => {
        await friendsModel.updateMany({}, { $set: { reaction: FriendRequestReaction.Accepted } }, { multi: true });
      });
      it('finds all friends', async () => {
        const limit = 5;
        const offset = 0;
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser.id}/friends?limit=${limit}&offset=${offset}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();

        expect(response.body.allFriendCount).toBe(4);
        expect(response.body.friends).toEqual([
          {
            // Abe Kenobi
            firstName: user2.firstName,
            userName: user2.userName,
            _id: user2._id.toString(),
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          },
          {
            // Albert DARTH Skywalker
            firstName: user1.firstName,
            userName: user1.userName,
            _id: user1._id.toString(),
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          },
          {
            // Darth Maul
            firstName: user5.firstName,
            userName: user5.userName,
            _id: user5._id.toString(),
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          },
          {
            // Darth Vader
            firstName: user3.firstName,
            userName: user3.userName,
            _id: user3._id.toString(),
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          },
        ]);
      });

      it('when applying limt and offset, and filtering on userName, returns the expected response', async () => {
        const limit = 1;
        const offset = 1;
        const userNameContains = 'darth';
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser.id}/friends?limit=${limit}&offset=${offset}&userNameContains=${userNameContains}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.allFriendCount).toBe(4);
        expect(response.body.friends).toEqual([
          // Darth Maul
          {
            firstName: user5.firstName,
            userName: user5.userName,
            _id: user5._id.toString(),
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          },
        ]);
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
          .get(`/users/${user3.id}/friends?limit=${limit}&offset=${offset}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.allFriendCount).toBe(3);
        expect(response.body.friends).toEqual([
          {
            // Abe Kenobi
            firstName: user2.firstName,
            userName: user2.userName,
            _id: user2._id.toString(),
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          },
          {
            // Princess Leia
            firstName: user4.firstName,
            userName: user4.userName,
            _id: user4._id.toString(),
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          },
          {
            // Star Wars Fan
            firstName: activeUser.firstName,
            userName: activeUser.userName,
            _id: activeUser._id.toString(),
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          },
        ]);
      });

      it('find all friend when filtering by username', async () => {
        const limit = 5;
        const offset = 0;
        const userNameContains = 'abe';
        const response = await request(app.getHttpServer())
          .get(`/users/${user3.id}/friends?limit=${limit}&offset=${offset}&userNameContains=${userNameContains}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.allFriendCount).toBe(3);
        expect(response.body.friends).toEqual([
          {
            firstName: user2.firstName,
            userName: user2.userName, // Abe Kenobi
            _id: user2._id.toString(),
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
          },
        ]);
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser.id}/friends`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser.id}/friends?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 20', async () => {
        const limit = 21;
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser.id}/friends?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 20');
      });

      it('offset should be a number', async () => {
        const limit = 10;
        const offset = 'a';
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser.id}/friends?limit=${limit}&offset=${offset}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('offset must be a number conforming to the specified constraints');
      });

      it('usern name be shorter than or equal to 30 characters', async () => {
        const limit = 10;
        const offset = 1;
        const userNameContains = new Array(35).join('z');
        const response = await request(app.getHttpServer())
          .get(`/users/${activeUser.id}/friends?limit=${limit}&offset=${offset}&userNameContains=${userNameContains}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('userNameContains must be shorter than or equal to 30 characters');
      });
    });
  });
});
