import {
  Controller, Post, Req, Body, Get,
  Delete, ValidationPipe, Query, HttpException, HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { pick } from '../utils/object-utils';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { getUserFromRequest } from '../utils/request-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { AcceptFriendRequestDto } from './dto/accept-friend-request.dto';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { CancelFriendshipOrDeclineRequestDto } from './dto/decline-or-cancel-friend-request.dto';
import { BlockSuggestedFriendDto } from './dto/block-suggest-friend.dto';
import { GetFriendshipDto } from './dto/get-frienship.dto';
import { LimitOffSetDto } from './dto/limit-offset.dto';
import { FriendsService } from './providers/friends.service';
import { BlocksService } from '../blocks/providers/blocks.service';
import { NotificationType } from '../schemas/notification/notification.enums';
import { NotificationsService } from '../notifications/providers/notifications.service';

@Controller('friends')
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService,
    private readonly blocksService: BlocksService,
    private readonly notificationsService: NotificationsService,
  ) { }

  @Post()
  async createFriendRequest(@Req() request: Request, @Body() createFriendRequestDto: CreateFriendRequestDto) {
    const user = getUserFromRequest(request);
    if (user.id === createFriendRequestDto.userId) {
      throw new HttpException('You cannot send a friend request to yourself', HttpStatus.BAD_REQUEST);
    }
    const block = await this.blocksService.blockExistsBetweenUsers(user.id, createFriendRequestDto.userId);
    if (block) {
      throw new HttpException('Request failed due to user block.', HttpStatus.BAD_REQUEST);
    }
    await this.friendsService.createFriendRequest(user._id, createFriendRequestDto.userId);

    const checkNotificationExistence = await this.notificationsService.notificationExists(
      createFriendRequestDto.userId,
      user._id,
      NotificationType.UserSentYouAFriendRequest,
    );
    if (!checkNotificationExistence) {
      // Create notification for post creator, informing them that a comment was added to their post
      await this.notificationsService.create({
        userId: createFriendRequestDto.userId as any,
        senderId: user._id,
        notifyType: NotificationType.UserSentYouAFriendRequest,
        notificationMsg: 'sent you a friend request',
      });
    }
    return { success: true };
  }

  @TransformImageUrls('$[*].profilePic')
  @Get('requests/sent')
  async getPendingSentFriendRequests(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: LimitOffSetDto,
  ) {
    const user = getUserFromRequest(request);
    const friends = await this.friendsService.getSentFriendRequests(user._id, query.limit, query.offset);
    return friends;
  }

  @TransformImageUrls('$[*].profilePic')
  @Get('requests/received')
  async getPendingReceivedFriendRequests(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: LimitOffSetDto,
  ) {
    const user = getUserFromRequest(request);
    const friends = await this.friendsService.getReceivedFriendRequests(user._id, query.limit, query.offset);
    return friends;
  }

  @Delete()
  async cancelFriendshipOrDeclineRequest(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    cancelFriendshipOrDeclineRequestDto: CancelFriendshipOrDeclineRequestDto,
  ) {
    const user = getUserFromRequest(request);
    await this.friendsService.cancelFriendshipOrDeclineRequest(user._id, cancelFriendshipOrDeclineRequestDto.userId);
    return { success: true };
  }

  @Post('requests/accept')
  async acceptFriendRequest(
    @Req() request: Request,
    @Body() acceptFriendRequestDto: AcceptFriendRequestDto,
  ) {
    try {
      const user = getUserFromRequest(request);
      await this.friendsService.acceptFriendRequest(acceptFriendRequestDto.userId, user._id);
      return { success: true };
    } catch (error) {
      throw new HttpException('Unable to accept friend request', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('friendship')
  async getFriendship(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: GetFriendshipDto,
  ) {
    const user = getUserFromRequest(request);
    const friend = await this.friendsService.findFriendship(user._id, query.userId);
    if (!friend) {
      return {
        reaction: null,
        from: null,
        to: null,
      };
    }
    return pick(friend, ['reaction', 'from', 'to']);
  }

  @Post('suggested/block')
  async blockSuggestedFriend(
    @Req() request: Request,
    @Body() blockSuggestedFriendDto: BlockSuggestedFriendDto,
  ) {
    const user = getUserFromRequest(request);
    await this.friendsService.createSuggestBlock(user._id, blockSuggestedFriendDto.userId);
    return { success: true };
  }
}
