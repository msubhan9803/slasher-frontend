import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { ChatGateway } from '../../chat/providers/chat.gateway';
import { ChatService } from '../../chat/providers/chat.service';

@Processor('message-count-update')
export class MessageCountUpdateConsumer {
    constructor(
        private readonly chatService: ChatService,
        private readonly chatGateway: ChatGateway,
    ) { }

    @Process('send-update-if-message-unread')

    async sendUpdateIfMessageUnread(job: Job<any>) {
        const message = await this.chatService.findByMessageId(job.data.messageId);
        if (!message.isRead) {
            await this.chatGateway.emitMessageCountUpdateEvent(message.senderId.toString());
            return { success: true };
        }
        return { success: false, error: 'Some error message' };
    }
}
