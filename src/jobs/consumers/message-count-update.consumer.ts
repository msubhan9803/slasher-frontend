import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from '../../notifications/providers/notifications.service';
import { ChatGateway } from '../../chat/providers/chat.gateway';
import { ChatService } from '../../chat/providers/chat.service';
import { UsersService } from '../../users/providers/users.service';

@Processor('message-count-update')
export class MessageCountUpdateConsumer {
    constructor(
        private readonly chatService: ChatService,
        private readonly chatGateway: ChatGateway,
        private readonly usersService: UsersService,
        private readonly notificationService: NotificationsService,
    ) { }

    @Process('send-update-if-message-unread')
    async sendUpdateIfMessageUnread(job: Job<any>) {
        const message = await this.chatService.findByMessageId(job.data.messageId);
        const user = await this.usersService.findById(message.senderId.toString(), true);
        if (!message.isRead && !(user.newConversationIds.find((id) => id.toString() === message.matchId.toString()))) {
            await Promise.all([
                this.usersService.addAndUpdateNewConversationId(message.senderId.toString(), message.matchId.toString()),
                this.chatGateway.emitConversationCountUpdateEvent(message.senderId.toString()),
                this.notificationService.sendChatMsgPushNotification(message.matchId, user)]);
        }
        // as long as this job completes without throwing an error, we will consider it successful
        return { success: true };
    }
}
