import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from '../schemas/notification/notification.schema';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './providers/notifications.gateway';
import { NotificationsService } from './providers/notifications.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule { }
