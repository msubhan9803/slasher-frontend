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
    private readonly chatService: ChatService,
    private friendsGateway: FriendsGateway,
  ) { }

  @Post()
  async createFriendRequest(@Req() request: Request, @Body() createFriendRequestDto: CreateFriendRequestDto) {
    const user = getUserFromRequest(request);
    if (user.id === createFriendRequestDto.userId) {
      throw new HttpException('You cannot send a friend request to yourself', HttpStatus.BAD_REQUEST);
    }
    const toUser = await this.usersService.findById(createFriendRequestDto.userId, true);
    if (!toUser) {
      throw new HttpException('Target friend not found.', HttpStatus.BAD_REQUEST);
    }

    const block = await this.blocksService.blockExistsBetweenUsers(user.id, createFriendRequestDto.userId);
    if (block) {
      throw new HttpException('Request failed due to user block.', HttpStatus.FORBIDDEN);
    }
    const friend = await this.friendsService.createFriendRequest(user.id, createFriendRequestDto.userId);

    // This prevents people from being able to spam each other with notifications in response to
    // rapid friend-unfriend-friend-unfriend actions.
    // Create notification for post creator, informing them that a comment was added to their post
    await Promise.all(
      [
        this.notificationsService.create({
          userId: createFriendRequestDto.userId as any,
          senderId: user._id,
          allUsers: [user._id as any], // senderId must be in allUsers for old API compatibility
          notifyType: NotificationType.UserSentYouAFriendRequest,
          notificationMsg: 'sent you a friend request',
          // "data" field must have exact value below for old iOS/Android app compatibility
          // TODO: Remove this "data" field once the old iOS/Android apps are retired
          data: {
            relationId: '',
            fromUser: {
              ...pick(user, ['userName', '_id']),
              image: user.profilePic,
            },
            toUser: {
              ...pick(toUser, ['userName', '_id']),
              image: toUser.profilePic,
            },
            notificationType: NotificationType.UserSentYouAFriendRequest,
            badgeCount: user.newNotificationCount,
          },
        }),
      ],
    );
    await Promise.all([this.usersService.updateNewFriendRequestCount(createFriendRequestDto.userId),
    this.friendsGateway.emitFriendRequestReceivedEvent(friend.to.toString())]);
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

    await Promise.all([
      await this.friendsService.cancelFriendshipOrDeclineRequest(user.id, cancelFriendshipOrDeclineRequestDto.userId),
      await this.chatService.deletePrivateDirectMessageConversation([
        new mongoose.Types.ObjectId(user.id),
        new mongoose.Types.ObjectId(cancelFriendshipOrDeclineRequestDto.userId),
      ]),
    ]);

    const friendship = await this.friendsService.findFriendship(user.id, cancelFriendshipOrDeclineRequestDto.userId);
    if (friendship) {
      this.friendsGateway.emitFriendRequestReceivedEvent(friendship.to.toString(), friendship.from.toString());
    }
    return { success: true };
  }

  @Post('requests/accept')
  async acceptFriendRequest(
    @Req() request: Request,
    @Body() acceptFriendRequestDto: AcceptFriendRequestDto,
  ) {
    try {
      const user = getUserFromRequest(request);
      const friendship = await this.friendsService.acceptFriendRequest(acceptFriendRequestDto.userId, user.id);
      if (friendship) {
        await Promise.all([
          this.notificationsService.create({
            userId: acceptFriendRequestDto.userId as any,
            senderId: user._id,
            notifyType: NotificationType.UserAcceptedYourFriendRequest,
            notificationMsg: 'accepted your friend request',
          }),
          this.friendsGateway.emitFriendRequestReceivedEvent(user.id),
        ]);
      }
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
