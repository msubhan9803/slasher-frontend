/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getQueueToken } from '@nestjs/bull';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { userFactory } from '../../../test/factories/user.factory';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { AppModule } from '../../app.module';
import { ChatGateway } from '../../chat/providers/chat.gateway';
import { ChatService } from '../../chat/providers/chat.service';
import { UserDocument } from '../../schemas/user/user.schema';
import { UsersService } from '../../users/providers/users.service';

describe('EnqueuerService', () => {
  let app: INestApplication;
  let module: TestingModule;
  let mockQueue;
  let connection: Connection;
  let chatService: ChatService;
  let chatGateway: ChatGateway;
  let activeUser: UserDocument;
  let activeUserAuthToken: string;
  let usersService: UsersService;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getQueueToken('message-count-update'))
      .useValue(mockQueue)
      .compile();

      connection = await moduleRef.get<Connection>(getConnectionToken());

      usersService = moduleRef.get<UsersService>(UsersService);
      chatService = moduleRef.get<ChatService>(ChatService);
      chatGateway = moduleRef.get<ChatGateway>(ChatGateway);
      configService = moduleRef.get<ConfigService>(ConfigService);
      messageCountUpdateQueue = moduleRef.get(ConfigService);

      app = moduleRef.createNestApplication();
  });

  afterAll(async () => module.close());

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    activeUser = await usersService.create(userFactory.build());
    activeUserAuthToken = activeUser.generateNewJwtToken(
      configService.get<string>('JWT_SECRET_KEY'),
    );
  });

  describe('#foo', () => {
    it('adds a job', async () => {
      await messageCountUpdateQueue.add(
        'send-update-if-message-unread',
        { messageId: 'my_message_id_here' },
        { delay: 15_000 }, // 15 second delay
      );

      jest.spyOn(chatGateway, 'emitMessageCountUpdateEvent').mockImplementation(() => Promise.resolve(undefined));
      expect(chatGateway.emitMessageCountUpdateEvent).toHaveBeenCalledWith('my_message_id_here');
    });
  });
});
