import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MessageCountUpdateConsumer } from '../jobs/consumers/message-count-update.consumer';
import { ChatModule } from '../chat/chat.module';
import { ChatGateway } from '../chat/providers/chat.gateway';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
        redis: {
          host: 'localhost',
          port: 6379,
        },
      }),
      BullModule.registerQueue({
        name: 'message-count-update',
      }),
      ChatModule,
  ],
  providers: [MessageCountUpdateConsumer, ChatGateway],
  exports: [BullModule],
})
export class QueuedJobsModule { }
