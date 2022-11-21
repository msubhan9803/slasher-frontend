import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io } from 'socket.io-client';
import { Connection, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module';
import { UserDocument } from '../../../src/schemas/user/user.schema';
import { userFactory } from '../../factories/user.factory';
import { ChatService } from '../../../src/chat/providers/chat.service';
import { UsersService } from '../../../src/users/providers/users.service';
import { RedisIoAdapter } from '../../../src/adapters/redis-io.adapter';
import { sleep } from '../../../src/utils/timer-utils';
import { MatchList, MatchListDocument } from '../../../src/schemas/matchList/matchList.schema';
import { dropCollections } from '../../helpers/mongo-helpers';

describe('Chat Gateway (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let chatService: ChatService;
  let usersService: UsersService;
  let configService: ConfigService;
  let address: any;
  let baseAddress: string;
  let activeUser: UserDocument;
  let user0: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
  let activeUserAuthToken: string;
  let matchListModel: Model<MatchListDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    chatService = moduleRef.get<ChatService>(ChatService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    matchListModel = moduleRef.get<Model<MatchListDocument>>(getModelToken(MatchList.name));

    app = moduleRef.createNestApplication();
    const redisIoAdapter = new RedisIoAdapter(app, configService);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    await app.init();

    address = app.getHttpServer().listen().address();
    baseAddress = `http://[${address.address}]:${address.port}`;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await dropCollections(connection);

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

    const payload = { senderId: '6359fbc11577d660fb284650', receiverId: '6359fbc11577d660fb284653', message: 'This is a test message' };
    await new Promise<void>((resolve) => {
      client.emit('chatTest', payload, (data) => {
        expect(data).toBe(`chat message from ${payload.senderId} to ${payload.receiverId}: ${payload.message}`);
        resolve();
      });
    });

    client.close();
  });

  describe('#sendPrivateDirectMessage', () => {
    beforeEach(async () => {
      await chatService.sendPrivateDirectMessage(user0._id, user1._id, 'Hi, test message.');
    });

    it('should send chatMessage', async () => {
      const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
      await sleep(1000);
      const payload = { toUserId: user1._id, message: 'Hi, test message via socket.' };
      await new Promise<void>((resolve) => {
        client.emit('chatMessage', payload, (data) => {
          expect(data.success).toBe(true);
          resolve();
        });
      });
      client.close();
    });
    it('should NOT send chatMessage', async () => {
      const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
      await sleep(2000);
      const payload = { toUserId: user1._id, message: null };
      await new Promise<void>((resolve) => {
        client.emit('chatMessage', payload, (data) => {
          expect(data.success).toBe(false);
          resolve();
        });
      });
      client.close();
    });
  });

  describe('#recentMessages', () => {
    let message1;
    let matchList;

    beforeEach(async () => {
      await chatService.sendPrivateDirectMessage(user0._id, user1._id, 'Hi, test message.');
      message1 = await chatService.sendPrivateDirectMessage(user1._id, user0._id, 'Hi, there!');
      await chatService.sendPrivateDirectMessage(user2._id, user0._id, 'Hi, Test!');
      matchList = await matchListModel.findOne({
        participants: user1._id,
      });
    });

    it('should get recentMessages', async () => {
      const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
      await sleep(2000);
      const payload = {
        matchListId: matchList._id,
      };
      await new Promise<void>((resolve) => {
        client.emit('recentMessages', payload, (data) => {
          expect(data).toHaveLength(2);
          resolve();
        });
      });
      client.close();
    });

    it('should get recentMessages with optional: `before` messageId', async () => {
      const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
      await sleep(2000);
      const payload = {
        matchListId: matchList._id, before: message1._id.toString(),
      };
      await new Promise<void>((resolve) => {
        client.emit('recentMessages', payload, (data) => {
          expect(data).toHaveLength(1);
          resolve();
        });
      });
      client.close();
    });

    it('should NOT get recentMessages', async () => {
      const client = io(baseAddress, { auth: { token: activeUserAuthToken }, transports: ['websocket'] });
      await sleep(2000);
      const payload = {
        matchListId: null, before: message1._id.toString(),
      };
      await new Promise<void>((resolve) => {
        client.emit('recentMessages', payload, (data) => {
          expect(data.success).toBe(false);
          resolve();
        });
      });
      client.close();
    });
  });
});
