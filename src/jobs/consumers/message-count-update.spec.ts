import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Job } from 'bull';
import { Connection } from 'mongoose';
import { userFactory } from '../../../test/factories/user.factory';
import { clearDatabase } from '../../../test/helpers/mongo-helpers';
import { AppModule } from '../../app.module';
import { ChatGateway } from '../../chat/providers/chat.gateway';
import { ChatService } from '../../chat/providers/chat.service';
import { UserDocument } from '../../schemas/user/user.schema';
import { UsersService } from '../../users/providers/users.service';
import { MessageCountUpdateConsumer } from './message-count-update.consumer';
import { rewindAllFactories } from '../../../test/helpers/factory-helpers.ts';

describe('#message-count-update', () => {
  let app: INestApplication;
  let connection: Connection;
  let chatService: ChatService;
  let chatGateway: ChatGateway;
  let activeUser: UserDocument;
  let usersService: UsersService;
  let messageCountUpdateConsumer: MessageCountUpdateConsumer;
  let user1: UserDocument;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .compile();

    connection = await moduleRef.get<Connection>(getConnectionToken());

    usersService = moduleRef.get<UsersService>(UsersService);
    chatService = moduleRef.get<ChatService>(ChatService);
    chatGateway = moduleRef.get<ChatGateway>(ChatGateway);
    messageCountUpdateConsumer = moduleRef.get(MessageCountUpdateConsumer);

    app = moduleRef.createNestApplication();
  });

  afterAll(async () => app.close());

  beforeEach(async () => {
    // Drop database so we start fresh before each test
    await clearDatabase(connection);

    // Reset sequences so we start fresh before each test
    rewindAllFactories();

    activeUser = await usersService.create(userFactory.build());
    user1 = await usersService.create(userFactory.build({ userName: 'Hannibal' }));
  });

  describe('should call `#chatGateway.emitConversationCountUpdateEvent` with appropriate userId', () => {
    it('adds a job', async () => {
      const message = await chatService.sendPrivateDirectMessage(activeUser.id, user1.id, 'Hi, test message 1.');
      jest.spyOn(chatGateway, 'emitConversationCountUpdateEvent').mockImplementation(() => Promise.resolve(undefined));
      await messageCountUpdateConsumer.sendUpdateIfMessageUnread({ data: { messageId: message._id.toString() } } as Job);

      expect(chatGateway.emitConversationCountUpdateEvent).toHaveBeenCalledWith(message.senderId.toString());
    });

    it('when add matchId in newConversationIds', async () => {
      const message = await chatService.sendPrivateDirectMessage(activeUser.id, user1.id, 'Hi, test message 1.');
      await messageCountUpdateConsumer.sendUpdateIfMessageUnread({ data: { messageId: message._id.toString() } } as Job);
      const user = await usersService.findById(user1.id);
      expect(user.newConversationIds).toEqual([message.matchId.toString()]);
    });
  });
});
