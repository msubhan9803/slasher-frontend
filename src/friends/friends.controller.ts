import {
  Controller, Post, Req, Body, Get,
  Delete, ValidationPipe, Query, HttpException, HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import mongoose from 'mongoose';
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
import { UsersService } from '../users/providers/users.service';
import { FriendsGateway } from './providers/friends.gateway';
import { ChatService } from '../chat/providers/chat.service';

@Controller({ path: 'friends', version: ['1'] })
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService,
    private readonly blocksService: BlocksService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
    private readonly friendsGateway: FriendsGateway,
    private readonly chatService: ChatService,
  ) { }

  @Post()
  async createFriendRequest(@Req() request: Request, @Body() createFriendRequestDto: CreateFriendRequestDto) {
    const user = getUserFromRequest(request);
    if (user.id === createFriendRequestDto.userId) {
      throw new HttpException('You cannot send a friend request to yourself', HttpStatus.BAD_REQUEST);
    }
    const block = await this.blocksService.blockExistsBetweenUsers(user.id, createFriendRequestDto.userId);
    if (block) {
      throw new HttpException('Request failed due to user block.', HttpStatus.FORBIDDEN);
    }
    const friend = await this.friendsService.createFriendRequest(user.id, createFriendRequestDto.userId);

    const recentNotificationExists = await this.notificationsService.similarRecentNotificationExists(
      createFriendRequestDto.userId,
      user.id,
      NotificationType.UserSentYouAFriendRequest,
    );
    // Do not send another notification about this if a similar notification was recently sent.
    // This prevents people from being able to spam each other with notifications in response to
    // rapid friend-unfriend-friend-unfriend actions.
    if (!recentNotificationExists) {
      // Create notification for post creator, informing them that a comment was added to their post
      await Promise.all([this.notificationsService.create({
        userId: createFriendRequestDto.userId as any,
        senderId: user._id,
        allUsers: [user._id as any], // senderId must be in allUsers for old API compatibility
        notifyType: NotificationType.UserSentYouAFriendRequest,
        notificationMsg: 'sent you a friend request',
      }),
      ]);
    }
    await Promise.all([this.usersService.updateNewFriendRequestCount(createFriendRequestDto.userId),
    this.friendsGateway.emitFriendRequestReceivedEvent(friend)]);
    return { success: true };
  }

  @TransformImageUrls('$[*].profilePic')
  @Get('requests/sent')
  async getPendingSentFriendRequests(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: LimitOffSetDto,
  ) {
    const user = getUserFromRequest(request);
    const friends = await this.friendsService.getSentFriendRequests(user.id, query.limit, query.offset);
    return friends;
  }

  @TransformImageUrls('$[*].profilePic')
  @Get('requests/received')
  async getPendingReceivedFriendRequests(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: LimitOffSetDto,
  ) {
    const user = getUserFromRequest(request);
    const friends = await this.friendsService.getReceivedFriendRequests(user.id, query.limit, query.offset);
    return friends;
  }

  @Delete()
  async cancelFriendshipOrDeclineRequest(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    cancelFriendshipOrDeclineRequestDto: CancelFriendshipOrDeclineRequestDto,
  ) {
    const user = getUserFromRequest(request);
    await this.friendsService.cancelFriendshipOrDeclineRequest(user.id, cancelFriendshipOrDeclineRequestDto.userId);
    await this.chatService.deletePrivateDirectMessageConversation([
      new mongoose.Types.ObjectId(user.id),
      new mongoose.Types.ObjectId(cancelFriendshipOrDeclineRequestDto.userId),
    ]);
    return { success: true };
  }

  @Post('requests/accept')
  async acceptFriendRequest(
    @Req() request: Request,
    @Body() acceptFriendRequestDto: AcceptFriendRequestDto,
  ) {
    try {
      const user = getUserFromRequest(request);
      await this.friendsService.acceptFriendRequest(acceptFriendRequestDto.userId, user.id);
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
    const friend = await this.friendsService.findFriendship(user.id, query.userId);
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
    await this.friendsService.createSuggestBlock(user.id, blockSuggestedFriendDto.userId);
    return { success: true };
  }
}
