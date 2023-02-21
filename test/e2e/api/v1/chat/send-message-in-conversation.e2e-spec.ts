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
import { FriendsService } from '../../../../../src/friends/providers/friends.service';
import { createTempFiles } from '../../../../helpers/tempfile-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../../../src/constants';
import { configureAppPrefixAndVersioning } from '../../../../../src/utils/app-setup-utils';

describe('Send Message In Conversation / (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let chatService: ChatService;
  let usersService: UsersService;
  let user0: User;
  let user1: User;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;
  let friendsService: FriendsService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = moduleRef.get<Connection>(getConnectionToken());

    chatService = moduleRef.get<ChatService>(ChatService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    friendsService = moduleRef.get<FriendsService>(FriendsService);

    app = moduleRef.createNestApplication();
    configureAppPrefixAndVersioning(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let message1;
  let message2;
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
    message2 = await chatService.sendPrivateDirectMessage(user0._id.toString(), user1._id.toString(), 'Hi, test message 2.');
    await friendsService.createFriendRequest(activeUser._id.toString(), user1._id.toString());
    await friendsService.acceptFriendRequest(activeUser._id.toString(), user1._id.toString());
  });
  describe('POST /api/v1/chat/conversation/:matchListId/message', () => {
    it('requires authentication', async () => {
      const matchId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).post(`/api/v1/chat/conversation/${matchId}/message`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Successfully send message', () => {
      it('gets the expected send image in conversations', async () => {
        await createTempFiles(async (tempPath) => {
          const matchListId = message1.matchId._id;
          const response = await request(app.getHttpServer())
            .post(`/api/v1/chat/conversation/${matchListId}/message`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2]);

          const expectedImageValueMatcher = expect.stringMatching(/\/chat\/chat.+\.png|jpe?g|gif/);
          expect(response.body).toEqual(
            {
              messages: [
                {
                  _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                  image: expectedImageValueMatcher,
                  message: 'Image',
                  fromId: activeUser._id.toString(),
                  senderId: user1._id.toString(),
                  matchId: message1.matchId._id.toString(),
                  createdAt: expect.any(String),
                  messageType: 0,
                  isRead: false,
                  status: 1,
                  deleted: false,
                },
                {
                  _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                  image: expectedImageValueMatcher,
                  message: 'Image',
                  fromId: activeUser._id.toString(),
                  senderId: user1._id.toString(),
                  matchId: message1.matchId._id.toString(),
                  createdAt: expect.any(String),
                  messageType: 0,
                  isRead: false,
                  status: 1,
                  deleted: false,
                },
                {
                  _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                  image: expectedImageValueMatcher,
                  message: 'Image',
                  fromId: activeUser._id.toString(),
                  senderId: user1._id.toString(),
                  matchId: message1.matchId._id.toString(),
                  createdAt: expect.any(String),
                  messageType: 0,
                  isRead: false,
                  status: 1,
                  deleted: false,
                },
              ],
            },
          );
        }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpeg' }, { extension: 'gif' }]);
      });

      it('when active user is not a participant it returns the expected error response', async () => {
        await createTempFiles(async (tempPath) => {
          const matchListId = message2.matchId._id;
          const response = await request(app.getHttpServer())
            .post(`/api/v1/chat/conversation/${matchListId}/message`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2]);
          expect(response.body).toEqual({ statusCode: 401, message: 'You are not a member of this conversation' });
        }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpeg' }, { extension: 'gif' }]);
      });

      it('returns a 404 when when the conversation is not found', async () => {
        await createTempFiles(async (tempPath) => {
          const matchListId = '638bf8215e0682526453ecb8';
          const response = await request(app.getHttpServer())
            .post(`/api/v1/chat/conversation/${matchListId}/message`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2]);
          expect(response.body).toEqual({ statusCode: 404, message: 'Conversation not found' });
        }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpeg' }, { extension: 'gif' }]);
      });

      it('should not find a conversation when given user is not a friend', async () => {
        await createTempFiles(async (tempPath) => {
          const user3 = await usersService.create(userFactory.build());
          const message3 = await chatService.sendPrivateDirectMessage(
            user3._id.toString(),
            activeUser._id.toString(),
            'Hi, test message 1.',
          );
          await friendsService.createFriendRequest(activeUser._id.toString(), user3._id.toString());
          const matchListId = message3.matchId._id;
          const response = await request(app.getHttpServer())
            .post(`/api/v1/chat/conversation/${matchListId}/message`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2]);
          expect(response.body).toEqual({ statusCode: 401, message: 'You are not friends with the given user.' });
        }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpeg' }, { extension: 'gif' }]);
      });

      it('only allows a maximum of 10 images', async () => {
        await createTempFiles(async (tempPath) => {
          const matchListId = message1.matchId._id;
          const response = await request(app.getHttpServer())
            .post(`/api/v1/chat/conversation/${matchListId}/message`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2])
            .attach('files', tempPath[3])
            .attach('files', tempPath[4])
            .attach('files', tempPath[5])
            .attach('files', tempPath[6])
            .attach('files', tempPath[7])
            .attach('files', tempPath[8])
            .attach('files', tempPath[9])
            .attach('files', tempPath[10])
            .expect(HttpStatus.BAD_REQUEST);
          expect(response.body).toEqual({ statusCode: 400, message: 'Only allow a maximum of 10 images' });
        }, [
          { extension: 'png' },
          { extension: 'png' },
          { extension: 'png' },
          { extension: 'png' },
          { extension: 'jpg' },
          { extension: 'jpg' },
          { extension: 'jpg' },
          { extension: 'jpg' },
          { extension: 'gif' },
          { extension: 'gif' },
          { extension: 'gif' },
        ]);
      });
    });

    describe('Validation', () => {
      it('matchListId must be a mongodb id', async () => {
        await createTempFiles(async (tempPath) => {
          const matchListId = '634912b2!2c2f4f5e@0e62289';
          const response = await request(app.getHttpServer())
            .post(`/api/v1/chat/conversation/${matchListId}/message`)
            .auth(activeUserAuthToken, { type: 'bearer' })
            .set('Content-Type', 'multipart/form-data')
            .attach('files', tempPath[0])
            .attach('files', tempPath[1])
            .attach('files', tempPath[2]);
          expect(response.body).toEqual({
            statusCode: 400,
            message: ['matchListId must be a mongodb id'],
            error: 'Bad Request',
          });
        }, [{ extension: 'png' }, { extension: 'jpg' }, { extension: 'jpeg' }]);
      });
    });
  });
});
