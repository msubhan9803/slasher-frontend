import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { Friend, FriendDocument } from '../../../src/schemas/friend/friend.schema';
import { FriendRequestReaction } from '../../../src/schemas/friend/friend.enums';

describe('Users suggested friends (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: User;
  let user1: User;
  let user2: User;
  let configService: ConfigService;
  let friendsModel: Model<FriendDocument>;

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
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    user1 = await usersService.create(userFactory.build({ userName: 'Michael' }));
    user2 = await usersService.create(userFactory.build({ userName: 'Freddy' }));
    await friendsModel.create({
      from: activeUser._id.toString(),
      to: user1._id.toString(),
      reaction: FriendRequestReaction.Accepted,
    });
    await friendsModel.create({
      from: user2._id.toString(),
      to: activeUser._id.toString(),
      reaction: FriendRequestReaction.Accepted,
    });
  });

  describe('GET /users/suggested-friends', () => {
    describe('When the endpoint limit is equal to the number of available suggested friends in the database', () => {
      beforeEach(async () => {
        for (let i = 0; i < 7; i += 1) {
          await usersService.create(userFactory.build());
        }
      });
      it('returns the expected number of suggested friends', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/suggested-friends')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toHaveLength(7);
      });
    });

    describe('When the endpoint limit is lower than than number of available suggested friends', () => {
      beforeEach(async () => {
        for (let i = 0; i < 5; i += 1) {
          await usersService.create(userFactory.build());
        }
      });
      it('returns the number equal to the limit', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/suggested-friends')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toHaveLength(5);
      });
    });

    describe('When the endpoint limit is higher than than number of available suggested friends', () => {
      beforeEach(async () => {
        for (let i = 0; i < 10; i += 1) {
          await usersService.create(userFactory.build());
        }
      });
      it('returns the number of suggested friends that are available', async () => {
        const response = await request(app.getHttpServer())
          .get('/users/suggested-friends')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toHaveLength(7);
      });
    });
  });
});
