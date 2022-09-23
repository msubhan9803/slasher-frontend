/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any, ...args: any[]) {
    console.log('client connected');
  }

  handleDisconnect(client: any) {
    console.log('client disconnected');
  }

  @SubscribeMessage('chatMessage')
  async sendReceiveMessage(@MessageBody() data: any): Promise<string> {
    return `chat message from ${data.senderId} to ${data.receiverId}: ${data.message}`;
  }
}
