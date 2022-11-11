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
    let message: Message;
    beforeEach(async () => {
      message = await chatService.sendPrivateDirectMessage(user0._id, user1._id, 'Hi, test message.');
    });

    it('successfully sends a message from one user to another user', async () => {
      const messageData = await messageModel.findById(message._id);

      expect(messageData.message).toBe('Hi, test message.');
    });

    it('successfully sends an image message', async () => {
      const testMessage = 'Hi, test message.';
      const image = 'noUser.jpg';
      const message1 = await chatService.sendPrivateDirectMessage(user0._id, user1._id, testMessage, image);
      const messageData = await messageModel.findById(message1._id);

      expect(messageData.message).toBe('Image');
    });
  });

  describe('#getConversations', () => {
    let unreadMessage1: Message;

    beforeEach(async () => {
      unreadMessage1 = await chatService.sendPrivateDirectMessage(user1._id, user0._id, 'Hi, there!');
      await chatService.sendPrivateDirectMessage(user0._id, user1._id, 'Test data');
      await chatService.sendPrivateDirectMessage(user2._id, user1._id, 'Test 123');
    });

    it('successfully returns a list of convesations for a user', async () => {
      const conversations = await chatService.getConversations(user0._id, 5);

      expect(conversations).toHaveLength(1);
      expect(conversations[0].latestMessage.message).toBe('Test data');
      expect(conversations[0].unreadCount).toBe(2);
    });

    it('successfully returns correct unreadCount', async () => {
      await messageModel.updateOne({ _id: unreadMessage1._id }, { $set: { isRead: true } });
      const conversations = await chatService.getConversations(user0._id, 5);

      expect(conversations).toHaveLength(1);
      expect(conversations[0].unreadCount).toBe(1);
    });

    it('successfully returns a list of conversations when before specified', async () => {
      const matchList = await matchListModel.findOne({
        participants: user2._id,
      });
      const conversations = await chatService.getConversations(user1._id, 5, matchList._id);

      expect(conversations).toHaveLength(1);
      expect(conversations[0].latestMessage.message).toBe('Test data');
    });
  });

  describe('#getMessages', () => {
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

    it('successfully returns some messages that are part of a conversation', async () => {
      const limit = 5;
      const messages = await chatService.getMessages(matchList._id, user0._id, limit);

      expect(messages).toHaveLength(2);
    });

    it('Should not return the deleted messages', async () => {
      const limit = 5;
      await messageModel.updateOne({ _id: message1._id }, { $set: { deleted: true } });
      const messages = await chatService.getMessages(matchList._id, user0._id, limit);

      expect(messages).toHaveLength(1);
      expect(messages[0].message).toBe('Hi, test message.');
    });

    it('successfully returns messages when before specified', async () => {
      const limit = 5;
      const messages = await chatService.getMessages(matchList._id, user0._id, limit, message1._id.toString());

      expect(messages).toHaveLength(1);
    });
  });
});
