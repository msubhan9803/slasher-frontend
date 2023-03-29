import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { ChatGateway } from '../../chat/providers/chat.gateway';
import { ChatService } from '../../chat/providers/chat.service';
import { UsersService } from '../../users/providers/users.service';

@Processor('message-count-update')
export class MessageCountUpdateConsumer {
    constructor(
        private readonly chatService: ChatService,
        private readonly chatGateway: ChatGateway,
        private readonly usersService: UsersService,
    ) { }

    @Process('send-update-if-message-unread')
    async sendUpdateIfMessageUnread(job: Job<any>) {
        const message = await this.chatService.findByMessageId(job.data.messageId);
        if (!message.isRead) {
            await this.chatGateway.emitMessageCountUpdateEvent(message.senderId.toString());
            await this.usersService.updateNewMessageCount(message.senderId.toString());
        }
        // as long as this job completes without throwing an error, we will consider it successful
        return { success: true };
    }
}
