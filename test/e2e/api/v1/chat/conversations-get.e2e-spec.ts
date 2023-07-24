import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { ChatService } from '../../../../../src/chat/providers/chat.service';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { Message, MessageDocument } from '../../../../../src/schemas/message/message.schema';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { MatchList, MatchListDocument } from '../../../../../src/schemas/matchList/matchList.schema';

describe('Conversations all / (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let chatService: ChatService;
  let usersService: UsersService;
  let user0: User;
  let user1: User;
  let user2: User;
  let user3: User;
  let user4: User;
  let blockedUser: User;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let messageModel: Model<MessageDocument>;
  let matchListModel: Model<MatchListDocument>;
  let blockedUserMatchListId: string;
  let user1MatchListId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    chatService = moduleRef.get<ChatService>(ChatService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    messageModel = moduleRef.get<Model<MessageDocument>>(getModelToken(Message.name));
    matchListModel = moduleRef.get<Model<MatchListDocument>>(getModelToken(MatchList.name));
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

    activeUser = await usersService.create(userFactory.build());
    user0 = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build(
      { profilePic: 'http://localhost:4444/placeholders/default_user_icon.png' },
    ));
    user2 = await usersService.create(userFactory.build());
    user3 = await usersService.create(userFactory.build());
    user4 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    const user1Message = await chatService.sendPrivateDirectMessage(user1._id.toString(), activeUser._id.toString(), 'Hi, test message 1.');
    await chatService.sendPrivateDirectMessage(activeUser._id.toString(), user1._id.toString(), 'Hi, test message 2.');
    user1MatchListId = user1Message.matchId.toString();
    // create a user, send a message to it and block the user
    blockedUser = await usersService.create(userFactory.build());
    // eslint-disable-next-line max-len
    const blockedUserMessage = await chatService.sendPrivateDirectMessage(activeUser._id.toString(), blockedUser._id.toString(), 'Hi, test message 3 - blocked user.');
    blockedUserMatchListId = blockedUserMessage.matchId.toString();

    await request(app.getHttpServer())
      .post('/api/v1/blocks')
      .auth(activeUserAuthToken, { type: 'bearer' })
      .send({ userId: blockedUser._id })
      .expect(HttpStatus.CREATED)
      .expect({ success: true });
  });

  describe('GET /api/v1/chat/conversations', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/chat/conversations').expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Successful get all conversations (except from blocked users)', () => {
      it('get expected conversations that a user is part of', async () => {
        const limit = 10;
        const response1 = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversations?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response1.status).toEqual(HttpStatus.OK);

        // Returned conversations should not have conversation of blocked user
        expect(response1.body.map((conversation) => conversation.latestMessage)).not.toContain('Hi, test message 3 - blocked user.');
        // Verify that conversation (matchlist) is marked `deleted: true`
        const blockedUserMatchList = await matchListModel.findById(blockedUserMatchListId);
        expect(blockedUserMatchList.deleted).toBeTruthy();

        // Expect message of `user1`
        expect(response1.body).toEqual(
          [
            {
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              participants: [
                {
                  _id: user1._id.toString(),
                  userName: 'Username3',
                  profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
                },
                {
                  _id: activeUser._id.toString(),
                  userName: 'Username1',
                  profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
                },
              ],
              unreadCount: 1,
              latestMessage: 'Hi, test message 2.',
              updatedAt: response1.body[0].updatedAt,
              lastMessageSentAt: response1.body[0].lastMessageSentAt,
            },
          ],
        );
        expect(response1.body).toHaveLength(1);

        // Unfriend `user1`
        await request(app.getHttpServer())
          .delete(`/api/v1/friends?userId=${user1._id.toString()}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .expect(HttpStatus.OK)
          .expect({ success: true });

        const response3 = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversations?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response3.status).toEqual(HttpStatus.OK);
        expect(response3.body).toHaveLength(0);
        // Verify that conversation (matchlist) is marked `deleted: true`
        const unfriendedUserMatchList = await matchListModel.findById(user1MatchListId);
        expect(unfriendedUserMatchList.deleted).toBeTruthy();
      });
    });

    describe('when `before` argument is supplied', () => {
      beforeEach(async () => {
        await chatService.sendPrivateDirectMessage(activeUser._id.toString(), user0._id.toString(), 'Hi, test message 1.');
        await chatService.sendPrivateDirectMessage(activeUser._id.toString(), user2._id.toString(), 'Hi, test message 3.');
        await chatService.sendPrivateDirectMessage(activeUser._id.toString(), user3._id.toString(), 'Hi, test message 4.');
        await chatService.sendPrivateDirectMessage(activeUser._id.toString(), user4._id.toString(), 'Hi, test message 5.');
      });
      it('get expected first and second sets of paginated results', async () => {
        const limit = 3;
        const firstResponse = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversations?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.status).toEqual(HttpStatus.OK);
        expect(firstResponse.body).toHaveLength(3);

        const secondResponse = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversations?limit=${limit}&before=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.status).toEqual(HttpStatus.OK);
        expect(secondResponse.body).toHaveLength(2);
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/chat/conversations')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversations?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('limit should be less than or equal to 30', async () => {
        const limit = 31;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversations?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must not be greater than 30');
      });

      it('before must be a mongodb id', async () => {
        const limit = 5;
        const before = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversations?limit=${limit}&before=${before}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'before must be a mongodb id',
        );
      });
    });
  });

  describe('PATCH /chat/mark-all-received-messages-read-for-chat', () => {
    let m1;
    let m2;
    let m3;
    let m4;
    beforeEach(async () => {
      m1 = await chatService.sendPrivateDirectMessage(user1._id.toString(), activeUser._id.toString(), 'Send 1');
      m2 = await chatService.sendPrivateDirectMessage(user1._id.toString(), activeUser._id.toString(), 'Send 2');
      m3 = await chatService.sendPrivateDirectMessage(user2._id.toString(), activeUser._id.toString(), 'Send 3');
      m4 = await chatService.sendPrivateDirectMessage(activeUser._id.toString(), user1._id.toString(), 'Reply 1');
    });

    it('Mark all received messages as `Read` for a given chat (matchListId)', async () => {
      m1 = await chatService.sendPrivateDirectMessage(user1._id.toString(), activeUser._id.toString(), 'Send 1');
      const matchId = m1.matchId._id;
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/chat/conversations/mark-all-received-messages-read-for-chat/${matchId}`)
        .auth(activeUserAuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body.success).toBe(true);

      m1 = await messageModel.findById(m1._id);
      m2 = await messageModel.findById(m2._id);
      m3 = await messageModel.findById(m3._id);
      m4 = await messageModel.findById(m4._id);

      expect(m1.isRead).toBe(true);
      expect(m2.isRead).toBe(true);
      expect(m3.isRead).toBe(false);
      expect(m4.isRead).toBe(false);
    });

    it('when matchListId is exist in newCoversationIds than expected response', async () => {
      const user5 = await usersService.create(userFactory.build());
      const user6 = await usersService.create(userFactory.build());
      const matchList = await chatService.createPrivateDirectMessageConversation(
        [new mongoose.Types.ObjectId(user5.id), new mongoose.Types.ObjectId(user6.id)],
      );
      user5.newConversationIds.push(matchList.id);
      user5.save();
      const user5AuthToken = user5.generateNewJwtToken(
        configService.get<string>('JWT_SECRET_KEY'),
      );

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/chat/conversations/mark-all-received-messages-read-for-chat/${matchList.id}`)
        .auth(user5AuthToken, { type: 'bearer' })
        .send();
      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body.success).toBe(true);

      const user = await usersService.findById(user5.id, true);
      expect(user.newConversationIds).toEqual([]);
    });

    describe('validation', () => {
      it('when param `matchListId` is not a valid mongo id', async () => {
        m1 = await chatService.sendPrivateDirectMessage(user1._id.toString(), activeUser._id.toString(), 'Send 1');
        const matchId = 'BAD_MONGO_OBJECT_ID';
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/chat/conversations/mark-all-received-messages-read-for-chat/${matchId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'matchListId must be a mongodb id',
          ],
          statusCode: 400,
        });
      });

      it('when user is not a member of the conversation', async () => {
        m1 = await chatService.sendPrivateDirectMessage(user0._id.toString(), user1._id.toString(), 'Send 1');
        const matchId = m1.matchId._id;
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/chat/conversations/mark-all-received-messages-read-for-chat/${matchId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
        expect(response.body).toEqual({ message: 'You are not a member of this conversation', statusCode: 401 });
      });

      it('when matchListId not found', async () => {
        m1 = await chatService.sendPrivateDirectMessage(user0._id.toString(), user1._id.toString(), 'Send 1');
        const nonExistingMatchId = new mongoose.Types.ObjectId();
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/chat/conversations/mark-all-received-messages-read-for-chat/${nonExistingMatchId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ message: 'Not found', statusCode: 404 });
      });
    });
  });
});
