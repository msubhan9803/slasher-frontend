import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { FriendsService } from '../../../src/friends/providers/friends.service';
import { ChatService } from '../../../src/chat/providers/chat.service';

describe('Users suggested friends (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let friendsService: FriendsService;
  let chatService: ChatService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    chatService = moduleRef.get<ChatService>(ChatService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();
  });

  describe('GET /users/initial-data', () => {
    describe('Available user initial data in the database', () => {
      let user1: UserDocument;
      let user2: UserDocument;
      let user3: UserDocument;
      let user4: UserDocument;
      let chat0;

      beforeEach(async () => {
        activeUser = await usersService.create(userFactory.build());
        activeUserAuthToken = activeUser.generateNewJwtToken(
          configService.get<string>('JWT_SECRET_KEY'),
        );
        user1 = await usersService.create(userFactory.build({ userName: 'Friend1' }));
        user2 = await usersService.create(userFactory.build({ userName: 'Friend2' }));
        user3 = await usersService.create(userFactory.build({ userName: 'Friend3' }));
        user4 = await usersService.create(userFactory.build({ userName: 'Friend4' }));

        await friendsService.createFriendRequest(user4.id, activeUser.id);
        await friendsService.createFriendRequest(user3.id, activeUser.id);
        await friendsService.createFriendRequest(user1.id, activeUser.id);
        await friendsService.createFriendRequest(user2.id, activeUser.id);

        await chatService.sendPrivateDirectMessage(activeUser.id, user1.id, 'Hi, test message 1.');
        await chatService.sendPrivateDirectMessage(activeUser.id, user2.id, 'Hi, test message 2.');
        await chatService.sendPrivateDirectMessage(activeUser.id, user3.id, 'Hi, test message 3.');
        chat0 = await chatService.getConversations(activeUser._id.toString(), 3);
      });
      it('returns the expected user initial data', async () => {
        const recentMessages = [];
        for (const chat of chat0) {
          chat._id = chat._id.toString();
          chat.user._id = chat.user._id.toString();
          recentMessages.push(chat);
        }
        const response = await request(app.getHttpServer())
          .get('/users/initial-data')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          userId: activeUser.id,
          userName: activeUser.userName,
          unreadNotificationCount: 6,
          recentMessages,
          friendRequestCount: 4,
          recentFriendRequests: [
            {
              _id: user2._id.toString(),
              userName: 'Friend2',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              firstName: user2.firstName,
            },
            {
              _id: user1._id.toString(),
              userName: 'Friend1',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              firstName: user1.firstName,
            },
            {
              _id: user3._id.toString(),
              userName: 'Friend3',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              firstName: user3.firstName,
            },
          ],
        });
      });
    });
  });
});
