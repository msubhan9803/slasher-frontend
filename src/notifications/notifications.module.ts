import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from '../schemas/notification/notification.schema';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './providers/notifications.gateway';
import { NotificationsService } from './providers/notifications.service';
import { PushNotificationsService } from './providers/push-notifications.service';
import { UserSettingModule } from '../settings/user-settings.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    UserSettingModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, PushNotificationsService, NotificationsGateway],
  exports: [NotificationsService, PushNotificationsService, NotificationsGateway],
})
export class NotificationsModule { }
