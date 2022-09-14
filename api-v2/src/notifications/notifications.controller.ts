import {
  Controller, Get, Req, Request,
} from '@nestjs/common';
import { UserDocument } from '../schemas/user.schema';
import { pick } from '../utils/object-utils';
import { getUserFromRequest } from '../utils/request-utils';
import { NotificationsService } from './providers/notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  async index(@Req() request: Request) {
    const user: UserDocument = getUserFromRequest(request);

    return (await this.notificationsService.findAllByUserId(user._id)).map(
      (notification) => pick(notification, ['notificationMsg', 'createdAt']),
    );
  }
}
