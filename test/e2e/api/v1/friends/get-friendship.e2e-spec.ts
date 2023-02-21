import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose, { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../../../src/app.module';
import { userFactory } from '../../../../factories/user.factory';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { FriendsService } from '../../../../../src/friends/providers/friends.service';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { FriendRequestReaction } from '../../../../../src/schemas/friend/friend.enums';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';

describe('Get Friendship (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
  let user3: UserDocument;
  let configService: ConfigService;
  let friendsService: FriendsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
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

    activeUser = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    user2 = await usersService.create(userFactory.build());
    user3 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );

    await friendsService.createFriendRequest(activeUser.id, user1.id);
    await friendsService.createFriendRequest(user3.id, activeUser.id);
  });

  describe('GET /api/v1/friends/friendship', () => {
    it('requires authentication', async () => {
      const userId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).get(`/api/v1/friends/friendship?userId=${userId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Get friendship data', () => {
      it('returns the expected friend info for two users with a pending friend record', async () => {
        const userId = user1.id;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/friends/friendship?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          reaction: FriendRequestReaction.Pending,
          from: activeUser.id,
          to: user1.id,
        });
      });

      it('returns the expected friend info for pending friend that to field has active user id', async () => {
        const userId = user3.id;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/friends/friendship?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          reaction: FriendRequestReaction.Pending,
          from: user3.id,
          to: activeUser.id,
        });
      });

      it('returns the expected friend info for two users with an accepted friend record', async () => {
        await friendsService.acceptFriendRequest(activeUser.id, user1.id);
        const userId = user1.id;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/friends/friendship?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          reaction: FriendRequestReaction.Accepted,
          from: activeUser.id,
          to: user1.id,
        });
      });

      it('returns the expected friend info for two users with a declined/cancelled friend record', async () => {
        await friendsService.cancelFriendshipOrDeclineRequest(activeUser.id, user1.id);
        const userId = user1.id;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/friends/friendship?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({
          reaction: FriendRequestReaction.DeclinedOrCancelled,
          from: activeUser.id,
          to: user1.id,
        });
      });

      it('for two users with NO friend record, then return response with null value', async () => {
        const userId = user2.id;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/friends/friendship?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();

        expect(response.body).toEqual({
          reaction: null,
          from: null,
          to: null,
        });
      });
    });

    describe('Validation', () => {
      it('userId should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/friends/friendship')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('userId should not be empty');
      });

      it('userId must be a mongodb id', async () => {
        const userId = 'aaa';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/friends/friendship?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('userId must be a mongodb id');
      });
    });
  });
});
