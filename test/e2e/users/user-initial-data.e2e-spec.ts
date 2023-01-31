import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
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
import { Message, MessageDocument } from '../../../src/schemas/message/message.schema';

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
  let messageModel: Model<MessageDocument>;

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
    messageModel = moduleRef.get<Model<MessageDocument>>(getModelToken(Message.name));

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
      let unreadLatestUser3;
      let unreadLatestUser1;

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
        unreadLatestUser3 = await chatService.sendPrivateDirectMessage(activeUser.id, user3.id, 'Hi, test message 3.');

        unreadLatestUser1 = await chatService.sendPrivateDirectMessage(user1.id, activeUser.id, 'Hi, test reply 1.');
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
          .get('/users/initial-data')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toEqual({
          user: pick(activeUser, ['id', 'userName', 'profilePic']),
          unreadMessageCount: 3,
          unreadNotificationCount: 5,
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

      it('1.`unreadMessageCount` excludes the deleted messags for user, 2. getConversations return non-deleted latest messg', async () => {
        // deleting `unread1` message, belongs to user1
        await messageModel.updateOne({ _id: unreadLatestUser1._id }, { $set: { deletefor: [activeUser._id] } });

        // deleting `unread0` message, belongs to user3
        await messageModel.updateOne({ _id: unreadLatestUser3._id }, { $set: { deletefor: [activeUser._id] } });
        // We need to refetch conversations as there was only one message for conversation two which is deleted
        // and thus that converstaion is not returned at all.
        conversations = await chatService.getConversations(activeUser._id.toString(), 3);

        // conversation for user3 is not returned because the only message is set to `deletefor` for the `activeUser`
        expect(conversations).toHaveLength(2);
        expect(conversations[0].latestMessage).toBe('Hi, test reply 3.'); // user2
        expect(conversations[1].latestMessage).toBe('Hi, test message 1.'); // user1

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
        // Value of `unreadMessageCount` is 2 (instead of 3) as we have set one message set to deleted
        //  for current user by adding activeUser's id in `deletefor` field of `unread1` message
        expect(response.body.unreadMessageCount).toBe(2);
        expect(response.body).toEqual({
          user: pick(activeUser, ['id', 'userName', 'profilePic']),
          unreadMessageCount: 2,
          unreadNotificationCount: 5,
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
