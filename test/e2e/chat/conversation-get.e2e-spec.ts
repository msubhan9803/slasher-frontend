import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/users/providers/users.service';
import { userFactory } from '../../factories/user.factory';
import { User } from '../../../src/schemas/user/user.schema';
import { ChatService } from '../../../src/chat/providers/chat.service';
import { clearDatabase } from '../../helpers/mongo-helpers';
import { SIMPLE_MONGODB_ID_REGEX } from '../../../src/constants';

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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let matchList1;
  let matchList2;
  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    activeUser = await usersService.create(userFactory.build());
    user0 = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
    matchList1 = await chatService.sendPrivateDirectMessage(user1._id.toString(), activeUser._id.toString(), 'Hi, test message 1.');
    matchList2 = await chatService.sendPrivateDirectMessage(user0._id.toString(), user1._id.toString(), 'Hi, test message 2.');
  });
  describe('GET /chat/conversation/:matchListId', () => {
    describe('Successful get match list data', () => {
      it('get expected match list details', async () => {
        const matchListId = matchList1.matchId._id;
        const response = await request(app.getHttpServer())
          .get(`/chat/conversation/${matchListId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body._id).toEqual(matchList1.matchId.id);
        expect(response.body).toEqual(
          {
            _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            roomName: '0',
            roomImage: null,
            flag: 1,
            createdBy: null,
            relationId: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
            roomCategory: 1,
            roomType: 1,
            participants: [
              {
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                userName: 'Username3',
                firstName: 'First name 3',
                profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              },
              {
                _id: expect.stringMatching(SIMPLE_MONGODB_ID_REGEX),
                userName: 'Username1',
                firstName: 'First name 1',
                profilePic: 'http://localhost:4444/placeholders/default_user_icon.png',
              },
            ],
            status: '0',
            deleted: false,
          },
        );
      });

      it('when active user is not participants than expected response', async () => {
        const matchListId = matchList2.matchId._id;
        const response = await request(app.getHttpServer())
          .get(`/chat/conversation/${matchListId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.body.message).toBe('You are not a member of this conversation');
      });

      it('returns a 404 when when the conversation is not found', async () => {
        const matchListId = '638bf8215e0682526453ecb8';
        const response = await request(app.getHttpServer())
          .get(`/chat/conversation/${matchListId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send()
          .expect(HttpStatus.NOT_FOUND);
        expect(response.body.message).toBe('Conversation not found');
      });
    });

    describe('Validation', () => {
      it('matchListId must be a mongodb id', async () => {
        const matchListId = '634912b2@2c2f4f5e0e6228#';
        const response = await request(app.getHttpServer())
          .get(`/chat/conversation/${matchListId}`)
          .auth(activeUserAuthToken, { type: 'bearer' })
          .send();
        expect(response.status).toEqual(HttpStatus.BAD_REQUEST);
        expect(response.body.message).toContain(
          'matchListId must be a mongodb id',
        );
      });
    });
  });
});
