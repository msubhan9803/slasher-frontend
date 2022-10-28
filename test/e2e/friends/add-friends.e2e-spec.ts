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
import { Friend, FriendDocument } from '../../../src/schemas/friend/friend.schema';

describe('Add Friends (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let user1: UserDocument;
  let configService: ConfigService;
  let friendsModel: Model<FriendDocument>;

  const sampleFriendsObject = {
    userId: '634912b2@2c2f4f5e0e6228#',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
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
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('Post /friends', () => {
    describe('Add Friend Successful', () => {
      it('when friend is successfully added than expected response', async () => {
        sampleFriendsObject.userId = user1._id;
        await request(app.getHttpServer())
          .post('/friends')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(sampleFriendsObject)
          .expect(HttpStatus.CREATED);
        const toFriend = { to: user1._id };
        const friends = await friendsModel.findOne(toFriend);
        expect(friends.to).toEqual(user1._id);
      });
    });

    describe('Validation', () => {
      it('userId should not be empty', async () => {
        sampleFriendsObject.userId = '';
        const response = await request(app.getHttpServer())
          .post('/friends')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(sampleFriendsObject);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId should not be empty',
        );
      });

      it('userId must be a mongodb id', async () => {
        const response = await request(app.getHttpServer())
          .post('/friends')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send(sampleFriendsObject);
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'userId must be a mongodb id',
        );
      });
    });
  });
});
