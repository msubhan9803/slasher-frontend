import {
  Controller, Post,
} from '@nestjs/common';
import { NotificationsGateway } from './providers/notifications.gateway';
import { NotificationsService } from './providers/notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) { }

  @Post('socket-test')
  async socketMessageEmitTest() {
    this.notificationsGateway.server.emit('hello', 'world');
    return 'test';
  }
}
