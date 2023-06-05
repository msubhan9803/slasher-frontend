/* eslint-disable max-lines */
import { INestApplication } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import mongoose, { Connection, Model } from 'mongoose';
import { AppModule } from '../../app.module';
import { ChatService } from './chat.service';
import { UsersService } from '../../users/providers/users.service';
import { UserDocument } from '../../schemas/user/user.schema';
import { userFactory } from '../../../test/factories/user.factory';
import { MatchList, MatchListDocument } from '../../schemas/matchList/matchList.schema';
import { Message, MessageDocument } from '../../schemas/message/message.schema';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { Chat, ChatDocument } from '../../schemas/chat/chat.schema';
import { configureAppPrefixAndVersioning } from '../../utils/app-setup-utils';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';
import { BlockAndUnblockDocument, BlockAndUnblock } from '../../schemas/blockAndUnblock/blockAndUnblock.schema';
import { BlockAndUnblockReaction } from '../../schemas/blockAndUnblock/blockAndUnblock.enums';

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
  let chatModel: Model<ChatDocument>;
  let blocksModel: Model<BlockAndUnblockDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());
    chatService = moduleRef.get<ChatService>(ChatService);
    usersService = moduleRef.get<UsersService>(UsersService);
    messageModel = moduleRef.get<Model<MessageDocument>>(getModelToken(Message.name));
    matchListModel = moduleRef.get<Model<MatchListDocument>>(getModelToken(MatchList.name));
    chatModel = moduleRef.get<Model<ChatDocument>>(getModelToken(Chat.name));
    blocksModel = moduleRef.get<Model<BlockAndUnblockDocument>>(getModelToken(BlockAndUnblock.name));

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

    it('message.created should match with `message.createdAt`, `matchList.updatedAt`, '
      + '`matchList.lastMessageSentAt`, and `chat.updatedAt`', async () => {
        const messageData = await messageModel.findById(message._id);
        const matchList = await matchListModel.findById(messageData.matchId);
        const chat = await chatModel.findOne({ matchId: messageData.matchId });

        const messageCreated = Number(message.created);
        [
          message.createdAt.getTime(),
          matchList.updatedAt.getTime(),
          matchList.lastMessageSentAt.getTime(),
          chat.updatedAt.getTime(),
        ].forEach((time) => {
          expect(time).toBe(messageCreated);
        });
      });
  });

  describe('#createPrivateDirectMessageConversation', () => {
    let users;
    let matchList;
    beforeEach(async () => {
      users = await Promise.all([
        userFactory.build(),
        userFactory.build(),
      ].map((userData) => usersService.create(userData)));

      matchList = await chatService.createPrivateDirectMessageConversation([users[0]._id, users[1]._id]);
    });

    it('successfully creates the expected MatchList', async () => {
      expect(matchList).toBeTruthy();
      expect(matchList.participants).toEqual([users[0]._id, users[1]._id]);
    });

    it('creates a corresponding Chat record (for old API compatibility)', async () => {
      const chat = await chatModel.findOne({ matchId: matchList._id });
      expect(chat).toBeTruthy();
      expect(chat.participants).toEqual(matchList.participants);
      expect(chat.relationId).toEqual(matchList.relationId);
      expect(chat.roomType).toEqual(matchList.roomType);
      expect(chat.roomCategory).toEqual(matchList.roomCategory);
    });
  });

  describe('#createOrFindPrivateDirectMessageConversationByParticipants', () => {
    let users;
    let matchList;

    beforeEach(async () => {
      users = await Promise.all([
        userFactory.build(),
        userFactory.build(),
        userFactory.build(),
      ].map((userData) => usersService.create(userData)));

      matchList = await chatService.createPrivateDirectMessageConversation([users[0]._id, users[1]._id]);
    });

    it('finds an existing conversation by searching for the participants of that conversation', async () => {
      const foundMatchList = await chatService.createOrFindPrivateDirectMessageConversationByParticipants([users[0]._id, users[1]._id]);
      expect(foundMatchList._id).toEqual(matchList._id);
    });

    it('creates a conversation if one does not exist with the given participants', async () => {
      const matchListCount = await matchListModel.count();
      const partcipants = [users[0]._id, users[2]._id];
      const foundMatchList = await chatService.createOrFindPrivateDirectMessageConversationByParticipants(partcipants);
      expect(foundMatchList.participants).toEqual(partcipants);
      const newMatchListCount = await matchListModel.count();
      expect(newMatchListCount - matchListCount).toBe(1);
    });
  });

  describe('#getConversations', () => {
    let messageLatest1;
    let m2;
    let m3;
    beforeEach(async () => {
      // User 1 sends a message and receives a message. Received message is unread.
      const message1 = await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Hi, there!');
      message1.isRead = true;
      await message1.save();
      messageLatest1 = await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'This is a reply');

      // User 1 sends two messages. Both sent messages are unread.
      m2 = await chatService.sendPrivateDirectMessage(user1.id, user2.id, 'This is a new message');
      m3 = await chatService.sendPrivateDirectMessage(user1.id, user2.id, 'This is another new message');

      // Send message to `user3` and `user3` blocks `user1` (Note: Block is bidirectional)
      await chatService.sendPrivateDirectMessage(user1.id, user3.id, 'You will block me!');
      await blocksModel.create({
        from: user1.id,
        to: user3.id,
        reaction: BlockAndUnblockReaction.Block,
      });
    });

    it('successfully returns a list of convesations for a user', async () => {
      const conversations = await chatService.getConversations(user1.id, 5);

      expect(conversations).toHaveLength(2);

      // Expect newest conversation in array position 0
      expect(conversations[0].latestMessage).toBe('This is another new message');
      // Expect unreadCount of 0 because the unread messages are the ones sent by the viewing user
      expect(conversations[0].unreadCount).toBe(0);

      // Expect second newest conversation in array position 1
      expect(conversations[1].latestMessage).toBe('This is a reply');
      // Expect unreadCount of 1 because the unread message in the conversation is unread by the viewing user
      expect(conversations[1].unreadCount).toBe(1);

      // Conversations should not converstaion from blocked users
      expect(conversations.map((m) => m.latestMessage)).not.toContain('You will block me!');
    });

    it('should filter deleted message for single user when returning list of convesations for a user', async () => {
      await messageModel.updateOne({ _id: messageLatest1._id }, { $set: { deletefor: [user1._id] } });
      await messageModel.updateOne({ _id: m2._id }, { $set: { deletefor: [user1._id] } });
      await messageModel.updateOne({ _id: m3._id }, { $set: { deletefor: [user1._id] } });

      const conversations = await chatService.getConversations(user1.id, 5);

      // Note: The second conversation should not be returned since all messages for second conversation
      // are set in `deletefor` this user
      expect(conversations).toHaveLength(1);

      // Expect newest conversation in array position 0 having latest message which is `non-deleted` message for user
      expect(conversations[0].latestMessage).toBe('Hi, there!');
      // Expect unreadCount of 1 because the unread message in the conversation is unread by the viewing user
      expect(conversations[0].unreadCount).toBe(1);
    });

    it('applies the given limit', async () => {
      const conversations = await chatService.getConversations(user1.id, 1);

      expect(conversations).toHaveLength(1);
      expect(conversations[0].latestMessage).toBe('This is another new message');
    });

    it('successfully returns the correct conversations when the before parameter is specified', async () => {
      const matchList = await matchListModel.findOne({
        participants: user2._id,
      });
      const conversations = await chatService.getConversations(user1.id, 5, matchList.id);
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
      await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Hi, test message.');
      message1 = await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Hi, there!');
      await chatService.sendPrivateDirectMessage(user2.id, user0.id, 'Hi, Test!');
      matchList = await matchListModel.findOne({
        participants: user1._id,
      });
    });

    it('successfully returns some messages that are part of a conversation', async () => {
      const limit = 5;
      const messages = await chatService.getMessages(matchList._id, user0.id, limit);

      expect(messages).toHaveLength(2);
    });

    it('Should not return the deleted messages', async () => {
      const limit = 5;
      await messageModel.updateOne({ _id: message1._id }, { $set: { deleted: true } });
      const messages = await chatService.getMessages(matchList._id, user0.id, limit);

      expect(messages).toHaveLength(1);
      expect(messages[0].message).toBe('Hi, test message.');
    });

    it('successfully returns messages when before specified', async () => {
      const limit = 5;
      const messages = await chatService.getMessages(matchList._id, user0.id, limit, message1._id.toString());

      expect(messages).toHaveLength(1);
    });

    it('should not return message deleted for a single user (using `deletefor` field)', async () => {
      const limit = 5;
      await messageModel.updateOne({ _id: message1._id }, { $set: { deletefor: [user0._id] } });
      const messages = await chatService.getMessages(matchList._id, user0.id, limit);

      expect(messages).toHaveLength(1);
    });
  });

  describe('#findMatchList', () => {
    let matchList;
    beforeEach(async () => {
      matchList = await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Hi, there!');
      matchList = await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Hi, there!');
    });
    it('get match list details', async () => {
      const matchListDetails = await chatService.findMatchList(matchList.matchId._id, true);
      expect(matchListDetails.participants).toHaveLength(2);
      expect(matchListDetails._id).toEqual(matchList.matchId._id);
    });

    it('get match list details when active only is false', async () => {
      const matchListDetails = await chatService.findMatchList(matchList.matchId._id, false);
      expect(matchListDetails.participants).toHaveLength(2);
      expect(matchListDetails._id).toEqual(matchList.matchId._id);
    });
  });

  describe('#getUnreadDirectPrivateMessageCount', () => {
    let msgLatest;

    beforeEach(async () => {
      const firstMessage = await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Send 1');
      firstMessage.isRead = true;
      firstMessage.save();
      await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Reply 1');
      await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Send 2');
      msgLatest = await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Send 3');
    });

    it('returns the expected count', async () => {
      expect(await chatService.getUnreadDirectPrivateMessageCount(user1.id)).toBe(2);
    });

    it('returns the expected count filtered with `deletefor` field (messages deleted for user)', async () => {
      await messageModel.updateOne({ _id: msgLatest._id }, { $set: { deletefor: [user1._id] } });
      expect(await chatService.getUnreadDirectPrivateMessageCount(user1.id)).toBe(1);
    });
  });

  describe('#markAllReceivedMessagesReadForChat', () => {
    let m1;
    let m2;
    let m3;
    let m4;

    beforeEach(async () => {
      m1 = await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Send 1');
      m2 = await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Send 2');
      m3 = await chatService.sendPrivateDirectMessage(user2.id, user0.id, 'Send 3');
      m4 = await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Reply 1');
    });

    it('all messages should be marked as read which are sent from a user to target user', async () => {
      const matchId = m1.matchId._id;
      await chatService.markAllReceivedMessagesReadForChat(user0._id.toString(), matchId);
      m1 = await messageModel.findById(m1._id);
      m2 = await messageModel.findById(m2._id);
      m3 = await messageModel.findById(m3._id);
      m4 = await messageModel.findById(m4._id);

      expect(m1.isRead).toBe(true);
      expect(m2.isRead).toBe(true);
      expect(m3.isRead).toBe(false);
      expect(m4.isRead).toBe(false);
    });
  });

  describe('#findByMessageId', () => {
    let message;
    beforeEach(async () => {
      message = await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Hi, test message.');
    });

    it('when message is exists than expected response', async () => {
      const messageData = await chatService.findByMessageId(message.id);
      expect(messageData.id).toEqual(message.id);
    });

    it('when message is does not exists than expected response', async () => {
      const messageData = await chatService.findByMessageId('5c9cb7138a874f1dcd0d8dcc');
      expect(messageData).toBeNull();
    });
  });

  describe('#markMessageAsRead', () => {
    let message;
    beforeEach(async () => {
      message = await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Hi, test message.');
    });
    it('finds the expected message and update the details', async () => {
      const updatedMesage = await chatService.markMessageAsRead(message._id);
      expect(updatedMesage.isRead).toBe(true);
    });
  });

  describe('#removeChatMessagesFromDb', () => {
    let message1;
    let message2;
    let message3;
    let matchList;

    beforeEach(async () => {
      message1 = await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Hi, test message.');
      message2 = await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Hi, there!');
      message3 = await chatService.sendPrivateDirectMessage(user2.id, user0.id, 'Hi, Test!');
      matchList = await matchListModel.findOne({
        participants: user1._id,
      });
    });

    it('works as expected', async () => {
      await chatService.deletePrivateDirectMessageConversations(user0.id, user1.id);

      // Check messages
      const messageData1 = await messageModel.findById(message1._id);
      expect(messageData1.deleted).toBe(true);

      const messageData2 = await messageModel.findById(message2._id);
      expect(messageData2.deleted).toBe(true);

      const messageData3 = await messageModel.findById(message3._id);
      expect(messageData3.message).toBe('Hi, Test!');

      // Check unread count
      expect(await chatService.getUnreadDirectPrivateMessageCount(user0.id)).toBe(1);
      expect(await chatService.getUnreadDirectPrivateMessageCount(user1.id)).toBe(0);

      // matchlist document should be deleted
      const nontExistsMatchList = await matchListModel.findOne(matchList._id);
      expect(nontExistsMatchList.deleted).toBe(true);
    });
  });

  describe('#deleteConversationMessages', () => {
    let message1;
    let message2;
    let matchList;

    beforeEach(async () => {
      message1 = await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Hi, test message.');
      message2 = await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Hi, there!');
      matchList = await matchListModel.findOne({
        participants: user1._id,
      });
    });

    it('should delete message for given user', async () => {
      // Perform delete conversation action by `user1`
      await chatService.deleteConversationMessages(user1._id.toString(), matchList._id.toString());

      // Check messages
      const messageData1 = await messageModel.findById(message1._id);
      expect(messageData1.deletefor.map((u) => u.toString())).toContain(user1._id.toString());

      const messageData2 = await messageModel.findById(message2._id);
      expect(messageData2.deletefor.map((u) => u.toString())).toContain(user1._id.toString());

      // Check unread count
      expect(await chatService.getUnreadDirectPrivateMessageCount(user0.id)).toBe(1);
      expect(await chatService.getUnreadDirectPrivateMessageCount(user1.id)).toBe(0);
    });

    it('should not add user twice to the deletefor field', async () => {
      // Intentionally call delete conversation action *twice* for `user1`
      await chatService.deleteConversationMessages(user1._id.toString(), matchList._id.toString());
      await chatService.deleteConversationMessages(user1._id.toString(), matchList._id.toString());

      // Check messages
      const messageData1 = await messageModel.findById(message1._id);
      expect(messageData1.deletefor.map((u) => u.toString())).toContain(user1._id.toString());
      expect(messageData1.deletefor).toHaveLength(1);
    });
  });

  describe('#deletePrivateDirectMessageConversation', () => {
    beforeEach(async () => {
      await chatService.sendPrivateDirectMessage(user0.id, user1.id, 'Hi, test message.');
      await chatService.sendPrivateDirectMessage(user1.id, user0.id, 'Hi, there!');
    });

    it('mark `matchList` as delete', async () => {
      // Perform delete conversation action by `user1`
      await chatService.deletePrivateDirectMessageConversation([
        user0._id as unknown as mongoose.Types.ObjectId,
        user1._id as unknown as mongoose.Types.ObjectId,
      ]);

      const updatedMatchList = await matchListModel.findOne({
        participants: user1._id,
      });
      expect(updatedMatchList.deleted).toBeTruthy();
    });
  });
});
