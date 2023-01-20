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
import { clearDatabase } from '../../helpers/mongo-helpers';
import { relativeToFullImagePath } from '../../../src/utils/image-utils';
import { pick } from '../../../src/utils/object-utils';
import { NotificationsService } from '../../../src/notifications/providers/notifications.service';
import { notificationFactory } from '../../factories/notification.factory';
import { NotificationDeletionStatus, NotificationReadStatus } from '../../../src/schemas/notification/notification.enums';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';

describe('Users suggested friends (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let usersService: UsersService;
  let activeUserAuthToken: string;
  let activeUser: UserDocument;
  let configService: ConfigService;
  let friendsService: FriendsService;
  let chatService: ChatService;
  let notificationsService: NotificationsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    chatService = moduleRef.get<ChatService>(ChatService);
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);
  });

  describe('GET /users/initial-data', () => {
    describe('Available user initial data in the database', () => {
      let user1: UserDocument;
      let user2: UserDocument;
      let user3: UserDocument;
      let user4: UserDocument;
      let conversations;

      beforeEach(async () => {
        activeUser = await usersService.create(userFactory.build({
          profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
        }));
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

        await chatService.sendPrivateDirectMessage(user1.id, activeUser.id, 'Hi, test reply 1.');
        await chatService.sendPrivateDirectMessage(user2.id, activeUser.id, 'Hi, test reply 2.');
        conversations = await chatService.getConversations(activeUser._id.toString(), 3);

        for (let index = 0; index < 5; index += 1) {
          await notificationsService.create(
            notificationFactory.build({
              userId: activeUser.id,
              is_deleted: NotificationDeletionStatus.NotDeleted,
              isRead: NotificationReadStatus.Unread,
            }),
          );
        }
        await notificationsService.create(
          notificationFactory.build({
            userId: activeUser.id,
            is_deleted: NotificationDeletionStatus.Deleted,
            isRead: NotificationReadStatus.Unread,
          }),
        );
      });
      it('returns the expected user initial data', async () => {
        const recentMessages = [];
        for (const chat of conversations) {
          chat._id = chat._id.toString();
          chat.updatedAt = chat.updatedAt.toISOString();
          // eslint-disable-next-line @typescript-eslint/no-loop-func
          chat.participants = chat.participants.map((participant) => ({
            ...participant,
            _id: participant._id.toString(),
            profilePic: relativeToFullImagePath(configService, participant.profilePic),
          }));
          recentMessages.push(chat);
        }
        const response = await request(app.getHttpServer())
          .get('/users/initial-data')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          user: pick(activeUser, ['id', 'userName', 'profilePic']),
          unreadMessageCount: 2,
          unreadNotificationCount: 5,
          recentMessages,
          friendRequestCount: 4,
          recentFriendRequests: [
            {
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              userName: 'Friend2',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              firstName: 'First name 3',
            },
            {
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              userName: 'Friend1',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              firstName: 'First name 2',
            },
            {
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              userName: 'Friend3',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              firstName: 'First name 4',
            },
          ],
        });
      });
    });
  });
});
