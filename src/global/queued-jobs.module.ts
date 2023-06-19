import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageCountUpdateConsumer } from '../jobs/consumers/message-count-update.consumer';
import { ChatModule } from '../chat/chat.module';
import { ChatGateway } from '../chat/providers/chat.gateway';
import { Message, MessageSchema } from '../schemas/message/message.schema';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'message-count-update',
    }),
    ChatModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [MessageCountUpdateConsumer, ChatGateway],
  exports: [BullModule, ChatGateway],
})
export class QueuedJobsModule { }
