import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { ChatService } from '../../../src/chat/providers/chat.service';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { Message, MessageDocument } from '../../../src/schemas/message/message.schema';

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
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let messageModel: Model<MessageDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    chatService = moduleRef.get<ChatService>(ChatService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
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
    await chatService.sendPrivateDirectMessage(user1._id.toString(), activeUser._id.toString(), 'Hi, test message 1.');
    await chatService.sendPrivateDirectMessage(activeUser._id.toString(), user1._id.toString(), 'Hi, test message 2.');
  });
  describe('GET /chat/conversations', () => {
    describe('Successful get all conversations', () => {
      it('get expected conversations that a user is part of', async () => {
        const limit = 10;
        const response = await request(app.getHttpServer())
          .get(`/chat/conversations?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.OK);
        for (const body of response.body) {
          expect(body.participants[0]).toEqual({
            _id: user1._id.toString(),
            userName: user1.userName,
            profilePic: user1.profilePic,
          });
        }
        expect(response.body).toHaveLength(1);
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
          .get(`/chat/conversations?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(firstResponse.status).toEqual(HttpStatus.OK);
        expect(firstResponse.body).toHaveLength(3);

        const secondResponse = await request(app.getHttpServer())
          .get(`/chat/conversations?limit=${limit}&before=${firstResponse.body[limit - 1]._id}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(secondResponse.status).toEqual(HttpStatus.OK);
        expect(secondResponse.body).toHaveLength(2);
      });
    });

    describe('Validation', () => {
      it('limit should not be empty', async () => {
        const response = await request(app.getHttpServer())
          .get('/chat/conversations')
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit should not be empty');
      });

      it('limit should be a number', async () => {
        const limit = 'a';
        const response = await request(app.getHttpServer())
          .get(`/chat/conversations?limit=${limit}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toContain('limit must be a number conforming to the specified constraints');
      });

      it('before must be a mongodb id', async () => {
        const limit = 5;
        const before = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .get(`/chat/conversations?limit=${limit}&before=${before}`)
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
        .patch(`/chat/conversations/mark-all-received-messages-read-for-chat/${matchId}`)
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

    describe('validation', () => {
      it('when param `matchListId` is not a valid mongo id', async () => {
        m1 = await chatService.sendPrivateDirectMessage(user1._id.toString(), activeUser._id.toString(), 'Send 1');
        const matchId = 'BAD_MONGO_OBJECT_ID';
        const response = await request(app.getHttpServer())
          .patch(`/chat/conversations/mark-all-received-messages-read-for-chat/${matchId}`)
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
          .patch(`/chat/conversations/mark-all-received-messages-read-for-chat/${matchId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
        expect(response.body).toEqual({ message: 'You are not a member of this conversation', statusCode: 401 });
      });

      it('when matchListId not found', async () => {
        m1 = await chatService.sendPrivateDirectMessage(user0._id.toString(), user1._id.toString(), 'Send 1');
        const nonExistingMatchId = new mongoose.Types.ObjectId();
        const response = await request(app.getHttpServer())
          .patch(`/chat/conversations/mark-all-received-messages-read-for-chat/${nonExistingMatchId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ message: 'Not found', statusCode: 404 });
      });
    });
  });
});
