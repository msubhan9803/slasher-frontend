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
import { clearDatabase } from '../../../test/helpers/mongo-helpers';

describe('ChatService', () => {
  let app: INestApplication;
  let connection: Connection;
  let chatService: ChatService;
  let usersService: UsersService;
  let user0: UserDocument;
  let user1: UserDocument;
  let user2: UserDocument;
  let user3: UserDocument;
  let user4: UserDocument;
  let activeUser: UserDocument;
  let messageModel: Model<MessageDocument>;
  let matchListModel: Model<MatchListDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
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
    await clearDatabase(connection);

    activeUser = await usersService.create(userFactory.build({ userName: 'Jack' }));
    user0 = await usersService.create(userFactory.build({ userName: 'Hannibal' }));
    user1 = await usersService.create(userFactory.build({ userName: 'Michael' }));
    user2 = await usersService.create(userFactory.build({ userName: 'Test' }));
    user3 = await usersService.create(userFactory.build({ userName: 'Denial' }));
    user4 = await usersService.create(userFactory.build({ userName: 'Rock' }));
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
    beforeEach(async () => {
      // User 1 sends a message and receives a message. Received message is unread.
      const message1 = await chatService.sendPrivateDirectMessage(user1._id, user0._id, 'Hi, there!');
      message1.isRead = true;
      await message1.save();
      await chatService.sendPrivateDirectMessage(user0._id, user1._id, 'This is a reply');

      // User 1 sends two messages. Both sent messages are unread.
      await chatService.sendPrivateDirectMessage(user1._id, user2._id, 'This is a new message');
      await chatService.sendPrivateDirectMessage(user1._id, user2._id, 'This is another new message');
    });

    it('successfully returns a list of convesations for a user', async () => {
      const conversations = await chatService.getConversations(user1._id, 5);

      expect(conversations).toHaveLength(2);

      // Expect newest conversation in array position 0
      expect(conversations[0].latestMessage).toBe('This is another new message');
      // Expect unreadCount of 0 because the unread messages are the ones sent by the viewing user
      expect(conversations[0].unreadCount).toBe(0);

      // Expect second newest conversation in array position 1
      expect(conversations[1].latestMessage).toBe('This is a reply');
      // Expect unreadCount of 1 because the unread message in the conversation is unread by the viewing user
      expect(conversations[1].unreadCount).toBe(1);
    });

    it('applies the given limit', async () => {
      const conversations = await chatService.getConversations(user1._id, 1);

      expect(conversations).toHaveLength(1);
      expect(conversations[0].latestMessage).toBe('This is another new message');
    });

    it('successfully returns the correct conversations when the before parameter is specified', async () => {
      const matchList = await matchListModel.findOne({
        participants: user2._id,
      });
      const conversations = await chatService.getConversations(user1._id, 5, matchList.id);
      expect(conversations).toHaveLength(1);
      expect(conversations[0].latestMessage).toBe('This is a reply');
    });

    describe('when `before` argument is supplied', () => {
      beforeEach(async () => {
        await chatService.sendPrivateDirectMessage(activeUser.id, user0.id, 'Hi, test message 1.');
        await chatService.sendPrivateDirectMessage(activeUser.id, user1.id, 'Hi, test message 2.');
        await chatService.sendPrivateDirectMessage(activeUser.id, user2.id, 'Hi, test message 3.');
        await chatService.sendPrivateDirectMessage(activeUser.id, user3.id, 'Hi, test message 4.');
        await chatService.sendPrivateDirectMessage(activeUser.id, user4.id, 'Hi, test message 5.');
      });
      it('returns the first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResults = await chatService.getConversations(activeUser.id, limit);
        expect(firstResults).toHaveLength(3);

        const secondResults = await chatService.getConversations(activeUser.id, limit, firstResults[limit - 1]._id.toString());
        expect(secondResults).toHaveLength(2);
      });
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
