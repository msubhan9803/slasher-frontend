import {
  Controller, Get, Post, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { pick } from '../utils/object-utils';
import { getUserFromRequest } from '../utils/request-utils';
import { NotificationsGateway } from './providers/notifications.gateway';
import { NotificationsService } from './providers/notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) { }

  @Get()
  async index(@Req() request: Request) {
    const user = getUserFromRequest(request);

    return (await this.notificationsService.findAllByUserId(user._id)).map(
      (notification) => pick(notification, ['notificationMsg', 'createdAt']),
    );
  }

  @Post('test')
  async socketMessageEmitTest() {
    this.notificationsGateway.server.emit('hello', 'world');
    return 'test';
  }
}
