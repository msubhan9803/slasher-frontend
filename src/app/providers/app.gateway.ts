/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
  ConnectedSocket,
} from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { SHARED_GATEWAY_OPTS } from '../../constants';
import { UsersService } from '../../users/providers/users.service';
import { sleep } from '../../utils/timer-utils';

@WebSocketGateway(SHARED_GATEWAY_OPTS)
/**
 * The AppGateway doesn't handle individual messages.  It's just a central place for performing
 * authentication when a user connects to a socket.  This is the place where we disconnect the
 * user if their token isn't valid.
 */
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly config: ConfigService, private readonly usersService: UsersService) { }

  async handleConnection(client: any, ...args: any[]) {
    console.log(`(app gateway) client connected: ${client.id}`);

    // We will first look for the token in the handshake auth field.  This is what clients will
    // generally be sending because it is more broadly compatible.  Browsers do not currently
    // offer a way to send authorization headers with a websocket connection request.
    let token = client.handshake.auth?.token;

    // Fall back to token from authentication header (mostly just for testing with clients like
    // Postman), since browsers don't currently offer a way to send headers when connecting to a
    // Websocket.
    if (!token && client.handshake.headers?.authorization) {
      token = client.handshake.headers?.authorization.split(' ')[1];
    }

    if (token) {
      let payload;

      try {
        payload = jwt.verify(token, this.config.get<string>('JWT_SECRET_KEY'));
        const { userId, passwordChangedAt } = payload;
        const user = await this.usersService.findById(userId);

        if (user && user.passwordChangedAt?.toISOString() === passwordChangedAt) {
          // User is valid. Create SocketUser entry for this socketId + userId combination.
          await this.usersService.createSocketUserEntry(client.id, user.id);
          // Emit an "authSuccess" event to let the client know that we have successfully
          // authenticated and are ready to receive additional socket messages.
          setTimeout(() => { client.emit('authSuccess', { success: true }); }, 100);
          return;
        }
      } catch (e) {
        if (e.name !== 'JsonWebTokenError') {
          // We expect a JsonWebTokenErrow when the token is invalid, but if we got a different
          // exception then we should re-throw it.
          throw e;
        }
      }
    }

    // If other checks failed above, then disconnect
    console.log(`(app gateway) client connection rejected due to invalid credentials: ${client.id}`);
    client.disconnect();
  }

  async handleDisconnect(client: any) {
    // During a disconnect, we always want to clean up the SocketUser entry
    // await this.usersService.deleteSocketUserEntry(client.id);
  }

  // This is just an end point for verifying a connection
  @SubscribeMessage('ping')
  async sendReceiveMessage(): Promise<string> {
    return 'pong';
  }
}
