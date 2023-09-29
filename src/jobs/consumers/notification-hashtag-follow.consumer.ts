import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from '../../notifications/providers/notifications.service';

@Processor('hashtag-follow-post')
export class NotificatationOfHashtagFollowPost {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Process('send-notification-of-hashtagfollow-post')
  async sendNotificationOfHashtagFollowPost(job: Job<any>) {
    const { userId, feedPostId, senderId, notifyType, notificationMsg } = job.data;

    for (let i = 0; i < userId.length; i += 1) {
      await this.notificationsService.create({
        userId: userId[i]._id,
        feedPostId,
        senderId,
        notifyType,
        notificationMsg,
      });
    }

    return { success: true };
  }
}
