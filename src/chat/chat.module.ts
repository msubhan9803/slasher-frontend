import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatService } from './providers/chat.service';
import { ChatController } from './chat.controller';
import { MatchList, MatchListSchema } from '../schemas/matchList/matchList.schema';
import { Message, MessageSchema } from '../schemas/message/message.schema';
import { Chat, ChatSchema } from '../schemas/chat/chat.schema';
import { FriendsModule } from '../friends/friends.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MatchList.name, schema: MatchListSchema }]),
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    FriendsModule,
  ],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule { }
