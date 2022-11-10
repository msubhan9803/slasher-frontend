import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { ChatService } from './chat.service';
import { UsersService } from '../../users/providers/users.service';
import { UserDocument } from '../../schemas/user/user.schema';
import { userFactory } from '../../../test/factories/user.factory';
import { MatchList, MatchListDocument } from '../../schemas/matchList/matchList.schema';
import { Message, MessageDocument } from '../../schemas/message/message.schema';

describe('ChatService', () => {
  let app: INestApplication;
  let connection: Connection;
  let chatService: ChatService;
  let usersService: UsersService;
  let user0: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
  let messageModel: Model<MessageDocument>;
  let matchListModel: Model<MatchListDocument>;
  let message: Message;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());
    chatService = moduleRef.get<ChatService>(ChatService);
    usersService = moduleRef.get<UsersService>(UsersService);
    messageModel = moduleRef.get<Model<MessageDocument>>(getModelToken(Message.name));
    matchListModel = moduleRef.get<Model<MatchListDocument>>(getModelToken(MatchList.name));

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();
    user0 = await usersService.create(userFactory.build({ userName: 'Hannibal' }));
    user1 = await usersService.create(userFactory.build({ userName: 'Michael' }));
    user2 = await usersService.create(userFactory.build({ userName: 'Test' }));
  });

  it('should be defined', () => {
    expect(chatService).toBeDefined();
  });

  describe('#sendPrivateDirectMessage', () => {
    beforeEach(async () => {
      message = await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Hi, test message.');
    });

    it('successfully sends a message from one user to another user', async () => {
      const messageData = await messageModel.findById(message._id);

      expect(messageData.message).toBe('Hi, test message.');
    });

    it('successfully sends an image message', async () => {
      const testMessage = 'Hi, test message.';
      const image = 'noUser.jpg';
      const message1 = await chatService.sendPrivateDirectMessage(user0.id, user1.id, testMessage, image);
      const messageData = await messageModel.findById(message1._id);

      expect(messageData.message).toBe('Image');
    });
  });

  describe('#getMessages', () => {
    let message1;
    beforeEach(async () => {
      matchListModel.create = jest.fn().mockImplementationOnce(() => ({
        _id: '5dbff89209dee20b18091ec3',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      })).mockImplementationOnce(() => ({
        _id: '5dbff89209dee20b18091ec3',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      })).mockImplementation(() => ({
        _id: '5dbff32e367a343830cd2f49',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }));
      matchListModel.updateOne = jest.fn().mockImplementation(() => ({}));
      matchListModel.findOne = jest.fn().mockImplementation(() => ({
        _id: '5dbff89209dee20b18091ec3',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }));
      await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Hi, test message.');
      message1 = await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Hi, there!');
      await chatService.sendPrivateDirectMessage(user2.id, user0.id, 'Hi, Test!');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('successfully returns some messages that are parth of a conversation', async () => {
      const limit = 5;
      const matchList = await matchListModel.findOne({
        participants: user1.id,
      });
      const messages = await chatService.getMessages(matchList._id, user0.id, limit);

      expect(messages).toHaveLength(3);
    });

    it('successfully returns messages when before specified', async () => {
      const limit = 5;
      // await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Hi, there!');
      const matchList = await matchListModel.findOne({
        participants: user1.id,
      });
      const messages = await chatService.getMessages(matchList._id, user0.id, limit, message1._id.toString());

      expect(messages).toHaveLength(1);
    });
  });

  describe('#getConversations', () => {
    beforeEach(async () => {
      matchListModel.create = jest.fn().mockImplementationOnce(() => ({
        _id: '5dbff89209dee20b18091ec3',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      })).mockImplementationOnce(() => ({
        _id: '5dbff89209dee20b18091ec3',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      })).mockImplementation(() => ({
        _id: '5dbff32e367a343830cd2f49',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }));
      matchListModel.updateOne = jest.fn().mockImplementation(() => ({}));
      matchListModel.findOne = jest.fn().mockImplementation(() => ({
        _id: '5dbff89209dee20b18091ec3',
        updatedAt: Date.now(),
        createdAt: Date.now(),
      }));
      await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Hi, there!');
      await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Test data');
      await chatService.sendPrivateDirectMessage(user2.id, user1.id, 'Test 123');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('successfully returns a list of convesations for a user', async () => {
      matchListModel.aggregate = jest.fn().mockImplementation(() => ([{
        _id: '5dbff32e367a343830cd2f49',
        latestMessage: [{
          message: 'Test data',
        }],
      }, {
        _id: '5dbff89209dee20b18091ec3',
        latestMessage: [{
          message: 'Test 123',
        }],
      }]));
      const conversations = await chatService.getConversations(user0.id, 5);

      expect(conversations).toHaveLength(2);
      expect(conversations[0].latestMessage[0].message).toBe('Test data');
      expect(conversations[1].latestMessage[0].message).toBe('Test 123');
    });

    it('successfully returns a list of conversations when before specified', async () => {
      matchListModel.aggregate = jest.fn().mockImplementation(() => ([{
        _id: '5dbff89209dee20b18091ec3',
        latestMessage: [{
          message: 'Test 123',
        }],
      }]));
      const matchList = await matchListModel.findOne({
        participants: user2.id,
      });
      const conversations = await chatService.getConversations(user1.id, 5, matchList.id);

      expect(conversations).toHaveLength(1);
      expect(conversations[0].latestMessage[0].message).toBe('Test 123');
    });
  });
});
