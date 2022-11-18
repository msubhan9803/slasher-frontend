/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SHARED_GATEWAY_OPTS } from '../../constants';

@WebSocketGateway(SHARED_GATEWAY_OPTS)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any, ...args: any[]) { }

  handleDisconnect(client: any) { }

  @SubscribeMessage('chatTest')
  async chatTest(@MessageBody() data: any): Promise<string> {
    return `chat message from ${data.senderId} to ${data.receiverId}: ${data.message}`;
  }
}
