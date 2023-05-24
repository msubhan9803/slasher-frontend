import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { UserDocument } from '../../../../../src/schemas/user/user.schema';
import { FriendsService } from '../../../../../src/friends/providers/friends.service';
import { ChatService } from '../../../../../src/chat/providers/chat.service';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { relativeToFullImagePath } from '../../../../../src/utils/image-utils';
import { NotificationsService } from '../../../../../src/notifications/providers/notifications.service';
import { notificationFactory } from '../../../../factories/notification.factory';
import { NotificationDeletionStatus, NotificationReadStatus } from '../../../../../src/schemas/notification/notification.enums';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { UserSettingsService } from '../../../../../src/settings/providers/user-settings.service';
import { userSettingFactory } from '../../../../factories/user-setting.factory';

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
  let userSettingsService: UserSettingsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    userSettingsService = moduleRef.get<UserSettingsService>(UserSettingsService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    chatService = moduleRef.get<ChatService>(ChatService);
    notificationsService = moduleRef.get<NotificationsService>(NotificationsService);

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
  });

  describe('GET /api/v1/users/initial-data', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/users/initial-data').expect(HttpStatus.UNAUTHORIZED);
    });

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
        await userSettingsService.create(
          userSettingFactory.build(
            {
              userId: activeUser._id,
            },
          ),
        );
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
        await chatService.sendPrivateDirectMessage(user2.id, activeUser.id, 'Hi, test reply 3.');
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
        expect(conversations).toHaveLength(3);
        expect(conversations[0].latestMessage).toBe('Hi, test reply 3.'); // user2
        expect(conversations[1].latestMessage).toBe('Hi, test reply 1.'); // user1
        expect(conversations[2].latestMessage).toBe('Hi, test message 3.'); // user3

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
          .get('/api/v1/users/initial-data')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          user: {
            id: activeUser.id,
            userName: 'Username1',
            profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
            newNotificationCount: 6,
            newFriendRequestCount: 0,
          },
          recentMessages,
          unreadNotificationCount: 5,
          newConversationIdsCount: 0,
          recentFriendRequests: [
            {
              _id: user2.id,
              userName: 'Friend2',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              firstName: user2.firstName,
              createdAt: expect.any(String),
            },
            {
              _id: user1.id,
              userName: 'Friend1',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              firstName: user1.firstName,
              createdAt: expect.any(String),
            },
            {
              _id: user3.id,
              userName: 'Friend3',
              profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              firstName: user3.firstName,
              createdAt: expect.any(String),
            },
          ],
        });
      });
    });
  });
});
