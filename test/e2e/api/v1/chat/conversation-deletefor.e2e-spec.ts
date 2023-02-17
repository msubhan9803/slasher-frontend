import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication, VersioningType } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { ChatService } from '../../../../../src/chat/providers/chat.service';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { Message, MessageDocument } from '../../../../../src/schemas/message/message.schema';

describe('Conversation / (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let chatService: ChatService;
  let usersService: UsersService;
  let user0: User;
  let user1: User;
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
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let message1;
  let message2;
  let message3;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    activeUser = await usersService.create(userFactory.build());
    user0 = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    message1 = await chatService.sendPrivateDirectMessage(user1._id.toString(), activeUser._id.toString(), 'Hi, test message 1.');
    message2 = await chatService.sendPrivateDirectMessage(activeUser._id.toString(), user1._id.toString(), 'Reply, test message 2.');
    message3 = await chatService.sendPrivateDirectMessage(user0._id.toString(), user1._id.toString(), 'Hi, test message 2.');
  });
  describe('DELETE /api/v1/chat/conversation/:matchListId', () => {
    describe('Successfully add userId to deletefor field of all messages of the conversation (matchListId)', () => {
      it('success response on delete converstaion messages call', async () => {
        const matchListId = message1.matchId.toString();
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/chat/conversation/${matchListId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
          expect(response.body).toEqual({ success: true });
        const messageData1 = await messageModel.findById(message1._id.toString());
        expect(messageData1.deletefor.map((u) => u.toString())).toContain(activeUser._id.toString());

        const messageData2 = await messageModel.findById(message2._id.toString());
        expect(messageData2.deletefor.map((u) => u.toString())).toContain(activeUser._id.toString());
      });

      it('when active user is not a participant it returns the expected error response', async () => {
        const matchListId = message3.matchId.toString();
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/chat/conversation/${matchListId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({ statusCode: 401, message: 'You are not a member of this conversation' });
      });

      it('returns a 404 when when the conversation is not found', async () => {
      const matchListId = new mongoose.Types.ObjectId().toString();
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/chat/conversation/${matchListId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ statusCode: 404, message: 'Conversation not found' });
      });
    });

    describe('Validation', () => {
      it('matchListId must be a mongodb id', async () => {
        const badMatchListId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .delete(`/api/v1/chat/conversation/${badMatchListId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({ message: ['matchListId must be a mongodb id'], statusCode: 400, error: 'Bad Request' });
      });
    });
  });
});
