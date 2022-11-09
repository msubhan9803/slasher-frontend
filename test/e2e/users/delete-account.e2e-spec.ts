import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../../../src/app.module';
import { userFactory } from '../../factories/user.factory';
import { UsersService } from '../../../src/users/providers/users.service';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { FriendsService } from '../../../src/friends/providers/friends.service';
import { Friend, FriendDocument } from '../../../src/schemas/friend/friend.schema';

describe('Users / delete account (e2e)', () => {
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

  describe('DELETE /users/delete-account', () => {
    describe('delete account request', () => {
      it('if activeUser delete account then it returns expected response', async () => {
        const userId = activeUser._id;
        await request(app.getHttpServer())
          .delete(`/users/delete-account?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.OK);

        const userData = await usersService.findById(activeUser.id);
        expect(userData.deleted).toBe(true); // check delete
        expect(bcrypt.compareSync('password', userData.password)).toBe(false); // check password change

        const query = {
          $or: [
            { from: activeUser._id },
            { to: activeUser._id },
          ],
        };
        const friends = await friendsModel.find(query);
        expect(friends).toHaveLength(0);
      });

      it('if query parameter userId different than activeUser then it returns expected response', async () => {
        const userId = user1._id;
        const response = await request(app.getHttpServer())
          .delete(`/users/delete-account?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain('Supplied userId does not match current user\'s id.');
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

      it('userId must be a mongodb id', async () => {
        const userId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .delete(`/friends?userId=${userId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId must be a mongodb id',
        );
      });
    });
  });
});
