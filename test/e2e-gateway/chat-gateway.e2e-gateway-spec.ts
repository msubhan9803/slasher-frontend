/* eslint-disable max-lines */
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io } from 'socket.io-client';
import { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { waitForAuthSuccessMessage, waitForSocketUserCleanup } from '../helpers/gateway-test-helpers';
import { RedisIoAdapter } from '../../src/adapters/redis-io.adapter';
import { AppModule } from '../../src/app.module';
import { ChatService } from '../../src/chat/providers/chat.service';
import { MatchListDocument, MatchList } from '../../src/schemas/matchList/matchList.schema';
import { ChatDocument, Chat } from '../../src/schemas/chat/chat.schema';
import { UserDocument } from '../../src/schemas/user/user.schema';
import { UsersService } from '../../src/users/providers/users.service';
import { userFactory } from '../factories/user.factory';
import { clearDatabase } from '../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../src/constants';
import { FriendsService } from '../../src/friends/providers/friends.service';

describe('Chat Gateway (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let chatService: ChatService;
  let usersService: UsersService;
  let configService: ConfigService;
  let baseAddress: string;
  let activeUser: UserDocument;
  let user0: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
  let activeUserAuthToken: string;
  let matchListModel: Model<MatchListDocument>;
  let chatModel: Model<ChatDocument>;
  let friendsService: FriendsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    chatService = moduleRef.get<ChatService>(ChatService);
    usersService = moduleRef.get<UsersService>(UsersService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    matchListModel = moduleRef.get<Model<MatchListDocument>>(getModelToken(MatchList.name));
    chatModel = moduleRef.get<Model<ChatDocument>>(getModelToken(Chat.name));

    app = moduleRef.createNestApplication();

    // Set up redis adapter
    const redisIoAdapter = new RedisIoAdapter(app, configService);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);

    // For socket tests, we use app.listen() instead of app.init()
    await app.listen(configService.get<number>('PORT'));
    baseAddress = `http://localhost:${configService.get<number>('PORT')}`;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    user0 = await usersService.create(userFactory.build({ userName: 'Hannibal' }));
    user1 = await usersService.create(userFactory.build({ userName: 'Michael' }));
    user2 = await usersService.create(userFactory.build({ userName: 'Test' }));
  });

  it('should be defined', () => {
    expect(chatService).toBeDefined();
    expect(usersService).toBeDefined();
  });

  it('should properly handle a chatTest event', async () => {
    const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
    await waitForAuthSuccessMessage(client);

    const payload = { senderId: '6359fbc11577d660fb284650', receiverId: '6359fbc11577d660fb284653', message: 'This is a test message' };
    await new Promise<void>((resolve) => {
      client.emit('chatTest', payload, (data) => {
        expect(data).toBe(`chat message from ${payload.senderId} to ${payload.receiverId}: ${payload.message}`);
        resolve();
      });
    });

    client.close();

    // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
    await waitForSocketUserCleanup(client, usersService);
  });

  describe('#sendPrivateDirectMessage', () => {
    describe('when target user is a friend', () => {
      beforeEach(async () => {
        await chatService.sendPrivateDirectMessage(user0._id, user1._id, 'Hi, test message.');
        await friendsService.createFriendRequest(activeUser._id.toString(), user1._id.toString());
        await friendsService.acceptFriendRequest(activeUser._id.toString(), user1._id.toString());
      });
      it('should send chatMessage', async () => {
        const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(client);

        const payload = { toUserId: user1._id, message: 'Hi, test message via socket.' };

        const data = await new Promise<any>((resolve) => {
          client.emit('chatMessage', payload, (receivedData: any) => {
            resolve(receivedData);
          });
        });

        const matchList = await matchListModel.findById(data.message.matchId);
        const chat = await chatModel.findOne({ matchId: data.message.matchId });

        expect(data.success).toBe(true);
        expect(data.message.message).toBe(payload.message);

        const messageCreated = Number(data.message.created);
        [
          new Date(data.message.createdAt).getTime(),
          new Date(matchList.updatedAt).getTime(),
          new Date(matchList.lastMessageSentAt).getTime(),
          new Date(chat.updatedAt).getTime(),
        ].forEach((time) => {
          expect(time).toBe(messageCreated);
        });

        expect(data).toEqual(
          {
            success: true,
            message: {
              message: 'Hi, test message via socket.',
              isRead: false,
              status: 1,
              deleted: false,
              created: expect.any(String),
              deletefor: [],
              createdAt: expect.any(String),
              matchId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              relationId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              fromId: activeUser._id.toString(),
              senderId: user1._id.toString(),
              messageType: 0,
              image: null,
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              urls: [],
              __v: 0,
            },
          },
        );

        client.close();
        // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
        await waitForSocketUserCleanup(client, usersService);
      });
      it('should NOT send chatMessage', async () => {
        const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(client);

        const payload = { toUserId: user1._id, message: null };
        await new Promise<void>((resolve) => {
          client.emit('chatMessage', payload, (data) => {
            expect(data.success).toBe(false);
            expect(data.message).toBeNull();
            resolve();
          });
        });
        client.close();
        // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
        await waitForSocketUserCleanup(client, usersService);
      });
    });

    it('should NOT send chatMessage when target user is not a friend', async () => {
      const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
      await waitForAuthSuccessMessage(client);

      const payload = { toUserId: user2._id, message: 'Hi, test message via socket.' };
      await new Promise<void>((resolve) => {
        client.emit('chatMessage', payload, (data) => {
          expect(data).toEqual({
            success: false,
            errorMessage: 'You are not friends with the given user.',
          });
          resolve();
        });
      });
      client.close();
      // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
      await waitForSocketUserCleanup(client, usersService);
    });
  });

  describe('#getMessages', () => {
    let message1;
    let matchList;

    beforeEach(async () => {
      await chatService.sendPrivateDirectMessage(activeUser._id, user1._id, 'Hi, test message.');
      message1 = await chatService.sendPrivateDirectMessage(user1._id, activeUser._id, 'Hi, there!');
      await chatService.sendPrivateDirectMessage(user2._id, activeUser._id, 'Hi, Test!');
      matchList = await matchListModel.findOne({
        participants: activeUser._id,
      });
    });

    describe('successful responses', () => {
      it('should return messages for a valid request, and should mark returned messages TO the user as read', async () => {
        const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(client);

        const payload = {
          matchListId: matchList._id,
        };

        const response = await new Promise<any>((resolve) => {
          client.emit('getMessages', payload, (data) => {
            resolve(data);
          });
        });
        client.close();

        expect(response).toHaveLength(2);

        // All messages NOT from the activeUser should be marked as read when they are returned
        // by the socket response.
        // Note: message.senderId actually means "message.toId" (bad naming in old API app)
        const messagesToActiveUser = response.filter((message) => message.senderId === activeUser.id);
        expect(messagesToActiveUser).toHaveLength(1);
        expect(messagesToActiveUser[0].isRead).toBe(true);

        // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
        await waitForSocketUserCleanup(client, usersService);
      });

      it('should return the expected messages when optional `before` messageId is given', async () => {
        const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(client);

        const payload = {
          matchListId: matchList._id, before: message1._id.toString(),
        };
        await new Promise<void>((resolve) => {
          client.emit('getMessages', payload, (data) => {
            expect(data).toHaveLength(1);
            resolve();
          });
        });
        client.close();
        // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
        await waitForSocketUserCleanup(client, usersService);
      });
    });

    describe('error responses', () => {
      it('should NOT return messages when matchListId is null', async () => {
        const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(client);

        const payload = {
          matchListId: null, before: message1._id.toString(),
        };
        await new Promise<void>((resolve) => {
          client.emit('getMessages', payload, (data) => {
            expect(data.success).toBe(false);
            resolve();
          });
        });
        client.close();
        // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
        await waitForSocketUserCleanup(client, usersService);
      });

      it('should return a permission denied error message when the matchList cannot be found', async () => {
        const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(client);

        const payload = {
          matchListId: '639041536cf487d9419d3425',
        };
        await new Promise<void>((resolve) => {
          client.emit('getMessages', payload, (data) => {
            expect(data.error).toBe('Permission denied');
            resolve();
          });
        });
        client.close();
        // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
        await waitForSocketUserCleanup(client, usersService);
      });

      it('should return a permission denied error message when a matchListId is given that the user is not a participant in', async () => {
        const user0AuthToken = user0.generateNewJwtToken(
          configService.get<string>('JWT_SECRET_KEY'),
        );
        const client = io(baseAddress, { auth: { token: user0AuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(client);

        const payload = {
          matchListId: matchList._id,
        };
        await new Promise<void>((resolve) => {
          client.emit('getMessages', payload, (data) => {
            expect(data.error).toBe('Permission denied');
            resolve();
          });
        });
        client.close();
        // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
        await waitForSocketUserCleanup(client, usersService);
      });
    });
  });
});
