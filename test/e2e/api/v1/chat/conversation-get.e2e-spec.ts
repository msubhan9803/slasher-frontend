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

  let message1;
  let message2;
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
    message1 = await chatService.sendPrivateDirectMessage(user1._id.toString(), activeUser._id.toString(), 'Hi, test message 1.');
    message2 = await chatService.sendPrivateDirectMessage(user0._id.toString(), user1._id.toString(), 'Hi, test message 2.');
  });
  describe('GET /api/v1/chat/conversation/:matchListId', () => {
    it('requires authentication', async () => {
      const matchId = new mongoose.Types.ObjectId();
      await request(app.getHttpServer()).get(`/api/v1/chat/conversation/${matchId}`).expect(HttpStatus.UNAUTHORIZED);
    });

    describe('Successfully gets the match list data', () => {
      it('gets the expected match list details', async () => {
        const matchListId = message1.matchId._id;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversation/${matchListId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual(
          {
            _id: message1.matchId._id.toString(),
            participants: [
              {
                _id: user1._id.toString(),
                userName: 'Username3',
                firstName: 'First name 3',
                profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              },
              {
                _id: activeUser._id.toString(),
                userName: 'Username1',
                firstName: 'First name 1',
                profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              },
            ],
          },
        );
      });

      it('when active user is not a participant it returns the expected error response', async () => {
        const matchListId = message2.matchId._id;
        const response = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversation/${matchListId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body).toEqual({ statusCode: 401, message: 'You are not a member of this conversation' });
      });

      it('returns a 404 when when the conversation is not found', async () => {
        const matchListId = '638bf8215e0682526453ecb8';
        const response = await request(app.getHttpServer())
          .get(`/api/v1/chat/conversation/${matchListId}`)
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
          .get(`/api/v1/chat/conversation/${matchListId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body).toEqual({ message: ['matchListId must be a mongodb id'], statusCode: 400, error: 'Bad Request' });
      });
    });
  });
});
