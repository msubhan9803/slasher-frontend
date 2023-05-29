/* eslint-disable max-lines */
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io } from 'socket.io-client';
import mongoose, { Connection, Model } from 'mongoose';
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
import { Message, MessageDocument } from '../../src/schemas/message/message.schema';
import { SIMPLE_ISO_8601_REGEX, SIMPLE_MONGODB_ID_REGEX } from '../../src/constants';
import { FriendsService } from '../../src/friends/providers/friends.service';
import { ChatGateway } from '../../src/chat/providers/chat.gateway';
import { rewindAllFactories } from '../helpers/factory-helpers.ts';

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
  let messageModel: Model<MessageDocument>;
  let chatModel: Model<ChatDocument>;
  let friendsService: FriendsService;
  let chatGateway: ChatGateway;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    chatService = moduleRef.get<ChatService>(ChatService);
    chatGateway = moduleRef.get<ChatGateway>(ChatGateway);
    usersService = moduleRef.get<UsersService>(UsersService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    messageModel = moduleRef.get<Model<MessageDocument>>(getModelToken(Message.name));
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

    // Reset sequences so we start fresh before each test
    rewindAllFactories();

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

  describe('#chatMessage', () => {
    describe('when target user is a friend', () => {
      beforeEach(async () => {
        await friendsService.createFriendRequest(activeUser.id, user1._id.toString());
        await friendsService.acceptFriendRequest(activeUser.id, user1._id.toString());
      });

      it('should send chatMessage and return the expected socket response', async () => {
        const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(client);

        const payload = { toUserId: user1._id, message: 'Hi, test message via socket.' };

        const chatMessageResponse = await new Promise<any>((resolve) => {
          client.emit('chatMessage', payload, (receivedData: any) => {
            resolve(receivedData);
          });
        });

        const matchList = await matchListModel.findById(chatMessageResponse.message.matchId);
        const chat = await chatModel.findOne({ matchId: chatMessageResponse.message.matchId });

        expect(chatMessageResponse.success).toBe(true);
        expect(chatMessageResponse.message.message).toBe(encodeURIComponent(payload.message));

        const messageCreated = Number(chatMessageResponse.message.created);
        [
          new Date(chatMessageResponse.message.createdAt).getTime(),
          new Date(matchList.updatedAt).getTime(),
          new Date(matchList.lastMessageSentAt).getTime(),
          new Date(chat.updatedAt).getTime(),
        ].forEach((time) => {
          expect(time).toBe(messageCreated);
        });

        expect(chatMessageResponse).toEqual(
          {
            success: true,
            message: {
              message: encodeURIComponent('Hi, test message via socket.'),
              created: expect.any(String),
              fromId: activeUser.id,
              createdAt: expect.any(String),
              image: null,
              urls: [],
              imageDescription: null,
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              matchId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
          },
        );

        client.close();

        // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
        await waitForSocketUserCleanup(client, usersService);
      });

      it('should emit the expected chatMessageReceived event for the message receiver', async () => {
        const senderClient = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(senderClient);

        const user1AuthToken = user1.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));
        const receiverClient = io(baseAddress, { auth: { token: user1AuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(receiverClient);

        const payload = { toUserId: user1._id, message: 'Hi, test message via socket.' };

        const chatMessageReceivedPayload = await new Promise<any>((resolve) => {
          receiverClient.on('chatMessageReceived', (...args) => {
            // NOTE: Avoid calling expect() method inside of the on() method, or the test will hang
            // if expect() comparison fails.
            resolve(args[0]);
          });

          senderClient.emit('chatMessage', payload);
        });

        senderClient.close();
        receiverClient.close();

        // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
        await waitForSocketUserCleanup(senderClient, usersService);
        await waitForSocketUserCleanup(receiverClient, usersService);

        expect(chatMessageReceivedPayload).toEqual({
          message: {
            _id: expect.any(String),
            createdAt: expect.stringMatching(SIMPLE_ISO_8601_REGEX),
            fromId: activeUser.id,
            image: null,
            urls: [],
            matchId: expect.any(String),
            message: encodeURIComponent('Hi, test message via socket.'),
          },
        });
      });

      it('should NOT send chatMessage when payload message is null', async () => {
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
            errorMessage: 'You must be friends with this user to perform this action.',
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
    let message0;
    let message1;
    let message2;
    let message3;
    let matchList;

    beforeEach(async () => {
      // user1 messages
      message0 = await chatService.sendPrivateDirectMessage(activeUser._id.toString(), user1._id.toString(), 'Hi, test message.');
      message1 = await chatService.sendPrivateDirectMessage(user1._id.toString(), activeUser._id.toString(), 'Hi, there!');
      matchList = await matchListModel.findOne({
        participants: activeUser._id,
      });

      // user2 messages
      message2 = await chatService.sendPrivateDirectMessage(user2._id.toString(), activeUser._id.toString(), 'Hi, Test!');
      message3 = await chatService.sendPrivateDirectMessage(user2._id.toString(), activeUser._id.toString(), 'Hi, Test2!');
      await chatService.sendPrivateDirectMessage(user2._id.toString(), activeUser._id.toString(), 'Hi, Test3!');
    });

    describe('successful responses', () => {
      it('should return messages for a valid request, and should mark returned messages TO the user as read', async () => {
        const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(client);

        const payload = {
          matchListId: matchList._id,
        };
        message1.image = '/chat/chat_768212f2-7b77-4903-8e5d-2ddce62361b8.jpg';
        message1.urls = ['/chat/chat_768212f2-7b77-4903-8e5d-2ddce62361b8.jpg'];
        message1.save();
        message0.image = '/chat/chat_768212f2-7b77-4903-8e5d-2ddce62361b8.jpg';
        message0.urls = ['/chat/chat_768212f2-7b77-4903-8e5d-2ddce62361b8.jpg'];
        message0.save();

        const response = await new Promise<any>((resolve) => {
          client.emit('getMessages', payload, (data) => {
            resolve(data);
          });
        });
        client.close();

        expect(response).toEqual([
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            message: 'Hi, there!',
            isRead: true,
            createdAt: expect.any(String),
            fromId: user1.id,
            senderId: activeUser.id,
            image: 'http://localhost:4444/api/v1/local-storage/chat/chat_768212f2-7b77-4903-8e5d-2ddce62361b8.jpg',
            urls: ['http://localhost:4444/api/v1/local-storage/chat/chat_768212f2-7b77-4903-8e5d-2ddce62361b8.jpg'],
            imageDescription: null,
          },
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            message: 'Hi, test message.',
            isRead: false,
            createdAt: expect.any(String),
            fromId: activeUser.id,
            senderId: user1.id,
            image: 'http://localhost:4444/api/v1/local-storage/chat/chat_768212f2-7b77-4903-8e5d-2ddce62361b8.jpg',
            urls: ['http://localhost:4444/api/v1/local-storage/chat/chat_768212f2-7b77-4903-8e5d-2ddce62361b8.jpg'],
            imageDescription: null,
          },
        ]);
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

        // Below `matchList` belongs to chat with `user1`
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

      it('should not return the deleted message for current user via `deletedfor` field', async () => {
        const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(client);

        // Set 2 messages of `user2` be deleted for `activeUser`
        await messageModel.updateOne({ _id: message2._id }, { $set: { deletefor: [activeUser._id] } });
        await messageModel.updateOne({ _id: message3._id }, { $set: { deletefor: [activeUser._id] } });

        // message2 belongs to chat with `user2`
        const payload = {
          matchListId: new mongoose.Types.ObjectId(message2.matchId),
        };

        const response = await new Promise<any>((resolve) => {
          client.emit('getMessages', payload, (data) => {
            resolve(data);
          });
        });
        client.close();

        // Since 2 out of 3 messgaes of `user2` are marked deleted via `deletefor` field, we expect only 1 message
        expect(response).toHaveLength(1);
        expect(response[0].message).toBe('Hi, Test3!');

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

  describe('#markMessageAsRead', () => {
    let message;
    beforeEach(async () => {
      message = await chatService.sendPrivateDirectMessage(user1.id, activeUser.id, 'Hi, test message.');
    });

    describe('successful responses', () => {
      it('should return the expected response, and should mark the message as read', async () => {
        const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(client);

        const payload = {
          messageId: message._id,
        };

        const response = await new Promise<any>((resolve) => {
          client.emit('messageRead', payload, (data) => {
            resolve(data);
          });
        });
        client.close();
        expect(response).toEqual({ success: true });

        // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
        await waitForSocketUserCleanup(client, usersService);
      });
    });

    describe('error responses', () => {
      it('returns the expected {success: false} response when messageId is null', async () => {
        const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(client);

        const payload = {
          messageId: null,
        };
        await new Promise<void>((resolve) => {
          client.emit('messageRead', payload, (data) => {
            expect(data.success).toBe(false);
            resolve();
          });
        });
        client.close();
        // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
        await waitForSocketUserCleanup(client, usersService);
      });

      it('should return a message not found error when the messageId cannot be found', async () => {
        const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(client);

        const payload = {
          messageId: '639041536cf487d9419d3425',
        };
        await new Promise<void>((resolve) => {
          client.emit('messageRead', payload, (data) => {
            expect(data.error).toBe('Message not found');
            resolve();
          });
        });
        client.close();
        // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
        await waitForSocketUserCleanup(client, usersService);
      });

      it('returns the expected error message when user tries to mark message as read but message was not sent TO that user', async () => {
        const message1 = await chatService.sendPrivateDirectMessage(activeUser.id, user1.id, 'Hi, test message.');
        const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
        await waitForAuthSuccessMessage(client);

        const payload = {
          messageId: message1.id,
        };
        await new Promise<void>((resolve) => {
          client.emit('messageRead', payload, (data) => {
            expect(data.success).toBe(false);
            expect(data.error).toBe('Unauthorized');
            resolve();
          });
        });
        client.close();
        // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
        await waitForSocketUserCleanup(client, usersService);
      });
    });
  });

  describe('#emitMessageForConversation', () => {
    let message0;
    let matchList;

    beforeEach(async () => {
      message0 = await chatService.sendPrivateDirectMessage(user1._id.toString(), activeUser._id.toString(), 'Hi, there!');
      matchList = await matchListModel.findOne({
        participants: activeUser._id,
      });
    });

    it('ChatController#sendMessageInConversation calls emitMessageForConversation, which emits the expected socket message', async () => {
      const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
      await waitForAuthSuccessMessage(client);

      const user1AuthToken = user1.generateNewJwtToken(configService.get<string>('JWT_SECRET_KEY'));
      const receiverClient = io(baseAddress, { auth: { token: user1AuthToken }, transports: ['websocket'] });
      await waitForAuthSuccessMessage(receiverClient);

      const message = [message0];
      const toUserId = matchList.participants.find((userId) => userId.toString() !== activeUser._id.toString());

      await chatGateway.emitMessageForConversation(message, toUserId);

      let receivedPayload;
      const socketListenPromise = new Promise<void>((resolve) => {
        receiverClient.on('chatMessageReceived', (...args) => {
          // NOTE: Avoid calling expect() method inside of the on() method, or the test will hang
          // if expect() comparison fails.
          [receivedPayload] = args;
          resolve();
        });
      });

      // Await socket response to receive emitted event
      await socketListenPromise;

      client.close();
      receiverClient.close();

      // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
      await waitForSocketUserCleanup(client, usersService);
      await waitForSocketUserCleanup(receiverClient, usersService);

      expect(receivedPayload).toEqual({
        message: {
          _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
          createdAt: expect.stringMatching(SIMPLE_ISO_8601_REGEX),
          fromId: toUserId.toString(),
          image: null,
          urls: [],
          matchId: matchList.id,
          message: 'Hi, there!',
        },
      });
    });
  });

  describe('#clearNewConversationIds', () => {
    it('when clear new conversation ids', async () => {
      const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
      await waitForAuthSuccessMessage(client);

      const response = await new Promise<any>((resolve) => {
        client.emit('clearNewConversationIds', (data) => {
          resolve(data);
        });
      });
      client.close();
      expect(response).toEqual({ newConversationIds: [] });
      // Need to wait for SocketUser cleanup after any socket test, before the 'it' block ends.
      await waitForSocketUserCleanup(client, usersService);
    });
  });
});
