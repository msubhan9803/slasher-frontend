import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { userFactory } from '../../factories/user.factory';
import { UsersService } from '../../../src/users/providers/users.service';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { FriendsService } from '../../../src/friends/providers/friends.service';
import { clearDatabase } from '../../helpers/mongo-helpers';

describe('Get Friends (e2e)', () => {
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
    await friendsService.createFriendRequest(user2._id.toString(), activeUser.id);
    await friendsService.createFriendRequest(user1._id.toString(), activeUser.id);
    await friendsService.createFriendRequest(activeUser.id, user2._id.toString());
    await friendsService.createFriendRequest(user3._id.toString(), activeUser.id);
  });

  describe('Get /friends/requests/received', () => {
    describe('Get Pending Received Friends Request', () => {
      it('find all pending request', async () => {
        const limit = 5;
        const offset = 0;
        const response = await request(app.getHttpServer())
          .get(`/friends/requests/received?limit=${limit}&offset=${offset}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual([
          {
            _id: user3._id.toString(),
            userName: 'Username4',
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            firstName: 'First name 4',
            createdAt: expect.any(String),
          },
          {
            _id: user1._id.toString(),
            userName: 'Username2',
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            firstName: 'First name 2',
            createdAt: expect.any(String),
          },
        ]);
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get('/friends/requests/received')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/friends/requests/received?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should not be grater than 20', async () => {
        const limit = 21;
        const response = await request(app.getHttpServer())
          .get(`/friends/requests/received?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 20');
      });

      it('offset should be a number', async () => {
        const limit = 10;
        const offset = 'a';
        const response = await request(app.getHttpServer())
          .get(`/friends/requests/received?limit=${limit}&offset=${offset}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('offset must be a number conforming to the specified constraints');
      });
    });
  });
});
