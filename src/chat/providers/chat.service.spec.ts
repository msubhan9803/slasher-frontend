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
  });

  it('should be defined', () => {
    expect(chatService).toBeDefined();
  });

  describe('#sendPrivateDirectMessage', () => {
    it('successfully sends a message from one user to another user', async () => {
      const testMessage = 'Hi, test message.';
      const message = await chatService.sendPrivateDirectMessage(user0.id, user1.id, testMessage);
      const messageData = await messageModel.findById(message._id);

      expect(messageData.message).toBe(testMessage);
    });

    it('successfully sends an image message', async () => {
      const testMessage = 'Hi, test message.';
      const image = 'noUser.jpg';
      const message = await chatService.sendPrivateDirectMessage(user0.id, user1.id, testMessage, image);
      const messageData = await messageModel.findById(message._id);

      expect(messageData.message).toBe('Image');
    });
  });

  describe('#getMessages', () => {
    it('successfully returns some messages that are parth of a conversation', async () => {
      const limit = 5;
      await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Hi, test message.');
      await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Hi, there!');
      const matchList = await matchListModel.findOne();
      const messages = await chatService.getMessages(matchList.id, user0.id, limit);

      expect(messages).toHaveLength(2);
    });

    it('successfully returns messages when before specified', async () => {
      const limit = 5;
      await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Hi, test message.');
      const message = await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Hi, there!');
      const matchList = await matchListModel.findOne();
      const messages = await chatService.getMessages(matchList.id, user0.id, limit, message._id.toString());

      expect(messages).toHaveLength(1);
    });
  });
});
