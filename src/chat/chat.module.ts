import { Global, Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { ChatService } from './providers/chat.service';
import { ChatController } from './chat.controller';
import { MatchList, MatchListSchema } from '../schemas/matchList/matchList.schema';
import { Message, MessageSchema } from '../schemas/message/message.schema';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { User, UserSchema } from '../schemas/user/user.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: MatchList.name, schema: MatchListSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => UsersModule),
  ],
  providers: [ChatService, LocalStorageService, S3StorageService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule { }
