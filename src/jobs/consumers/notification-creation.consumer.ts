import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from '../../notifications/providers/notifications.service';

@Processor('notification')
export class NotificationCreationConsumer {
    constructor(
        private readonly notificationService: NotificationsService,
    ) { }

    @Process('create-notification')
    async sendUpdateIfMessageUnread(job: Job<any>) {
        await this.notificationService.create(job.data);
        return { success: true };
    }
}
