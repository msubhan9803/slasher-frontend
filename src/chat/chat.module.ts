import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './providers/chat.gateway';
import { ChatService } from './providers/chat.service';
import { ChatController } from './chat.controller';
import { MatchList, MatchListSchema } from '../schemas/matchList/matchList.schema';
import { Message, MessageSchema } from '../schemas/message/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MatchList.name, schema: MatchListSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
