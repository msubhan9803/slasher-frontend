import {
  Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, Query, Req, ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { NotificationDeletionStatus, NotificationReadStatus } from '../schemas/notification/notification.enums';
import { getUserFromRequest } from '../utils/request-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { ParamNotificationIdDto } from './dto/param-notificationId.dto';
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

  @Get()
  async findAll(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: GetNotificationsDto,
  ) {
    const user = getUserFromRequest(request);
    return this.notificationsService.findAllByUser(user.id, query.limit, query.before);
  }

  @Delete(':id')
  async deleteNotification(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamNotificationIdDto,
  ) {
    const user = getUserFromRequest(request);
    const notification = await this.notificationsService.findById(param.id);
    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }
    if ((notification).userId.toString() !== user.id) {
      throw new HttpException('Permission denied.', HttpStatus.UNAUTHORIZED);
    }
    await this.notificationsService.update(param.id, { is_deleted: NotificationDeletionStatus.Deleted });
    return { success: true };
  }

  @Patch(':id/mark-as-read')
  async markAsRead(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: ParamNotificationIdDto,
  ) {
    const user = getUserFromRequest(request);
    const notification = await this.notificationsService.findById(param.id);
    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }
    if ((await notification).userId.toString() !== user.id) {
      throw new HttpException('Permission denied.', HttpStatus.UNAUTHORIZED);
    }
    await this.notificationsService.update(param.id, { isRead: NotificationReadStatus.Read });
    return { success: true };
  }

  @Patch('mark-all-as-read')
  async markAllAsRead(
    @Req() request: Request,
  ) {
    const user = getUserFromRequest(request);
    await this.notificationsService.markAllAsReadForUser(user.id);
    return { success: true };
  }
}
