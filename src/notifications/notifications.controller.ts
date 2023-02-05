import {
  Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Query, Req, ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { FeedPostsService } from '../feed-posts/providers/feed-posts.service';
import { NotificationDeletionStatus, NotificationReadStatus, NotificationType } from '../schemas/notification/notification.enums';
import { NotificationDocument } from '../schemas/notification/notification.schema';
import { getUserFromRequest } from '../utils/request-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { ParamNotificationIdDto } from './dto/param-notificationId.dto';
import { NotificationsGateway } from './providers/notifications.gateway';
import { NotificationsService } from './providers/notifications.service';
import { pick } from '../utils/object-utils';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly feedPostsService: FeedPostsService,
  ) { }

  @TransformImageUrls(
    '$[*].senderId.profilePic',
    '$[*].rssFeedProviderId.logo',
  )
  @Get()
  async findAll(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: GetNotificationsDto,
  ) {
    const user = getUserFromRequest(request);
    const notifications = await this.notificationsService.findAllByUser(user.id, query.limit, query.before);

    // Note: Right now, the old API is generating FeedPosts from RssFeedProviders, but for some
    // reason the feedPostId is never set by the old API.  For this reason, we need to add
    // feedPostIds to the response before it is returned.
    // TODO: Delete the method call below (and the rssFeedIdsToFeedPostIdsForNotifications
    // method itself) after the NEW api generates notifications for rss-based FeedPosts and
    // includes the feedPostId in the notification data.
    const rssFeedIdsToFeedPostIds = await this.rssFeedIdsToFeedPostIdsForNotifications(notifications);

    // Assign the post id values to the notfications, when needed
    return notifications.map((notification) => {
      const notificationAsObject = notification.toObject();
      if (notificationAsObject.rssFeedId && !notificationAsObject.feedPostId) {
        notificationAsObject.feedPostId = { _id: rssFeedIdsToFeedPostIds[notificationAsObject.rssFeedId.toString()]._id };
      }
      return notificationAsObject;
    }).map((notification) => pick(notification, [
      '_id', 'createdAt', 'feedCommentId', 'feedPostId', 'feedReplyId', 'isRead',
      'notificationMsg', 'notifyType', 'rssFeedProviderId', 'senderId', 'userId',
    ]));
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

  /**
   * Looks through the given array of notifications and for any that are of type
   * NotificationType.NewPostFromFollowedRssFeedProvider, and returns a map of rssFeedIds
   * to feedPost ids.
   *
   * @param notifications
   */
  // TODO: Add test for this
  async rssFeedIdsToFeedPostIdsForNotifications(notifications: NotificationDocument[]) {
    const rssFeedNotifications = notifications.filter(
      (notification) => (
        notification.notifyType === NotificationType.NewPostFromFollowedRssFeedProvider
        && notification.rssFeedId
      ),
    );
    if (rssFeedNotifications.length === 0) { return {}; }

    // Find the associated posts
    const postsForRssFeedNotifications = await this.feedPostsService.findAllByRssFeedId(
      rssFeedNotifications.map((notification) => notification.rssFeedId.toString()),
    );
    // Generate a map of rssFeedIdsToPostIds
    const rssFeedIdsToPosts = postsForRssFeedNotifications.reduce(
      // eslint-disable-next-line no-param-reassign
      (obj, value) => { obj[value.rssFeedId.toString()] = value; return obj; },
      {},
    );

    return rssFeedIdsToPosts;
  }
}
