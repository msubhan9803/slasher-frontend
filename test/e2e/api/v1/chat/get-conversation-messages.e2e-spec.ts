import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import mongoose, { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../../../src/app.module';
import { UsersService } from '../../../../../src/users/providers/users.service';
import { userFactory } from '../../../../factories/user.factory';
import { User } from '../../../../../src/schemas/user/user.schema';
import { ChatService } from '../../../../../src/chat/providers/chat.service';
import { clearDatabase } from '../../../../helpers/mongo-helpers';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';
import { rewindAllFactories } from '../../../../helpers/factory-helpers.ts';
import { SIMPLE_ISO_8601_REGEX, SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';

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

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    chatService = moduleRef.get<ChatService>(ChatService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let message0;
  let message1;
  let message3;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(userFactory.build());
    user0 = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    message0 = await chatService.sendPrivateDirectMessage(
      user0._id.toString(),
      user1._id.toString(),
      'Message 0: user0 to user1',
    );
    message1 = await chatService.sendPrivateDirectMessage(
      activeUser._id.toString(),
      user1._id.toString(),
      'Message 1: activeUser to user1',
    );
    await chatService.sendPrivateDirectMessage(
      user1._id.toString(),
      activeUser._id.toString(),
      'Message 2: user1 to activeUser',
    );
    message3 = await chatService.sendPrivateDirectMessage(
      user1._id.toString(),
      activeUser._id.toString(),
      'message-content-does-not-matter-for-image-message',
      '/messages/12345.png',
      'This is a great image',
    );
    await chatService.sendPrivateDirectMessage(
      user1._id.toString(),
      activeUser._id.toString(),
      'Message 4: activeUser to user1',
    );
    await chatService.sendPrivateDirectMessage(
      user1._id.toString(),
      activeUser._id.toString(),
      'Message 5: activeUser to user1',
    );
  });
  describe('GET /api/v1/chat/conversation/:matchListId/messages', () => {
    it('requires authentication', async () => {
      const matchId = new mongoose.Types.ObjectId().toString();
      await request(app.getHttpServer()).get(`/api/v1/chat/conversation/${matchId}/messages`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Successfully gets the messages', () => {
      it('gets the expected messages, and all of them are marked as read because `before` param was not used', async () => {
        const matchListId = message1.matchId._id.toString();
        const response = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversation/${matchListId}/messages?limit=3`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual(
          [
            {
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              createdAt: expect.stringMatching(SIMPLE_ISO_8601_REGEX),
              fromId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              image: null,
              urls: [],
              imageDescription: null,
              isRead: true,
              message: 'Message 5: activeUser to user1',
              senderId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              createdAt: expect.stringMatching(SIMPLE_ISO_8601_REGEX),
              fromId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              image: null,
              urls: [],
              imageDescription: null,
              isRead: true,
              message: 'Message 4: activeUser to user1',
              senderId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
            {
              _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              createdAt: expect.stringMatching(SIMPLE_ISO_8601_REGEX),
              fromId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              image: 'http://localhost:4444/api/v1/local-storage/messages/12345.png',
              urls: ['http://localhost:4444/api/v1/local-storage/messages/12345.png'],
              imageDescription: 'This is a great image',
              isRead: true,
              message: 'Image', // always expect value of "Image" for message for an image message
              senderId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            },
          ],
        );
      });

      it('gets the expected messages when the `before` parameter is used, and the `isRead` values for the '
        + 'messages are NOT modified becasuse the `before` parameter was provided', async () => {
          const matchListId = message1.matchId._id.toString();
          const response = await request(app.getHttpServer())
            .get(`/api/v1/chat/conversation/${matchListId}/messages?limit=3&before=${message3._id.toString()}`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .send();
          expect(response.body).toEqual(
            [
              {
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                createdAt: expect.stringMatching(SIMPLE_ISO_8601_REGEX),
                fromId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                image: null,
                urls: [],
                imageDescription: null,
                isRead: false, // this value was false before these results were retrieve, and it has not been modified
                message: 'Message 2: user1 to activeUser',
                senderId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              },
              {
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                createdAt: expect.stringMatching(SIMPLE_ISO_8601_REGEX),
                fromId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                image: null,
                urls: [],
                imageDescription: null,
                isRead: false, // this value was false before these results were retrieve, and it has not been modified
                message: 'Message 1: activeUser to user1',
                senderId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
              },
            ],
          );
        });

      it('when active user is not a participant it returns the expected error response', async () => {
        const matchListId = message0.matchId._id.toString();
        const response = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversation/${matchListId}/messages?limit=10`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({ statusCode: 401, message: 'You are not a member of this conversation' });
      });

      it('returns a 404 when when the conversation is not found', async () => {
        const matchListId = new mongoose.Types.ObjectId().toString();
        const response = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversation/${matchListId}/messages?limit=10`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body).toEqual({ statusCode: 404, message: 'Conversation not found' });
      });
    });

    describe('Validation', () => {
      it('matchListId must be a mongodb id', async () => {
        const matchListId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversation/${matchListId}/messages?limit=10`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({ message: ['matchListId must be a mongodb id'], statusCode: 400, error: 'Bad Request' });
      });

      it('limit param is required', async () => {
        const matchListId = message1.matchId._id.toString();
        const response = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversation/${matchListId}/messages`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({
          message: [
            'limit must not be greater than 30',
            'limit must be a number conforming to the specified constraints',
            'limit should not be empty',
          ],
          statusCode: 400,
          error: 'Bad Request',
        });
      });

      it('limit must not be greater than the allowed value', async () => {
        const matchListId = message1.matchId._id.toString();
        const response = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversation/${matchListId}/messages?limit=31`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({ message: ['limit must not be greater than 30'], statusCode: 400, error: 'Bad Request' });
      });

      it('the before param must not be greater than the allowed value', async () => {
        const matchListId = message1.matchId._id.toString();
        const response = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversation/${matchListId}/messages?limit=10&before=xyz`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({ message: ['before must be a mongodb id'], statusCode: 400, error: 'Bad Request' });
      });
    });
  });
});
