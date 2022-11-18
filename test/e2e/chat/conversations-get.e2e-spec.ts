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

describe('Conversations all / (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let chatService: ChatService;
  let usersService: UsersService;
  let user1: User;
  let activeUserAuthToken: string;
  let activeUser: User;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    connection = await moduleRef.get<Connection>(getConnectionToken());

    chatService = moduleRef.get<ChatService>(ChatService);
    usersService = moduleRef.get<UsersService>(UsersService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await connection.dropDatabase();

    activeUser = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build());
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
        expect(response.body).toHaveLength(1);
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
});
