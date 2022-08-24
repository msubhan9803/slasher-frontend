import { Controller, Get, Req, Request } from '@nestjs/common';
import { UserDocument } from '../schemas/user.schema';
import { pick } from '../utils/object-utils';
import { NotificationsService } from './providers/notifications.service';

@Controller('users')
export class UsersController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async index(@Req() request: Request) {
    const user: UserDocument = (request as any).user;

    return (await this.notificationsService.findAllByUserId(user.id)).map(
      (notification) => pick(notification, ['notificationMsg', 'createdAt']),
    );
  }
}
