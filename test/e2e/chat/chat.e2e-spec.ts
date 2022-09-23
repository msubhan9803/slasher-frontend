import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io } from 'socket.io-client';
import { ChatGateway } from '../../../src/chat/providers/chat.gateway';

describe('Chat (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ChatGateway],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Chat gateway test', () => {
    it('should connect successfully and acknowledge event', async () => {
      const address = app.getHttpServer().listen().address();
      const baseAddress = `http://[${address.address}]:${address.port}`;
      const client = io(baseAddress);

      const chatBody = { senderId: 'test_sender', receiverId: 'test_receiver', message: 'Hello ! test done' };
      await new Promise<void>((resolve) => {
        client.emit('chatMessage', chatBody, (data) => {
          expect(data).toBe(`chat message from ${chatBody.senderId} to ${chatBody.receiverId}: ${chatBody.message}`);
          resolve();
        });
      });
      client.close();
    });
  });
});
