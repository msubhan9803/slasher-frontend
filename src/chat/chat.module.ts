import { Module } from '@nestjs/common';
import { ChatGateway } from './providers/chat.gateway';

@Module({
  providers: [ChatGateway],
})
export class ChatModule {}
