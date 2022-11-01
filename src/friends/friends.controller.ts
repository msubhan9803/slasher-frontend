import {
  Controller, Post, Req, Body, Get,
  Delete, ValidationPipe, Query,
} from '@nestjs/common';
import { Request } from 'express';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { getUserFromRequest } from '../utils/request-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { AcceptFriendRequestDto } from './dto/accept-friend-request-dto';
import { CreateFriendRequestDto } from './dto/create-friend-request-dto';
import { DeclineOrCancelFriendRequestDto } from './dto/decline-or-cancel-friend-request-dto';
import { LimitOffSetDto } from './dto/limit-offset.dto';
import { FriendsService } from './providers/friends.service';

@Controller('friends')
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService,
  ) { }

  @Post()
  async createFriendRequest(@Req() request: Request, @Body() createFriendRequestDto: CreateFriendRequestDto) {
    const user = getUserFromRequest(request);
    await this.friendsService.createFriendRequest(user._id, createFriendRequestDto.userId);
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
  async declineOrCancelFriendRequest(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) declineOrCancelFriendRequestDto: DeclineOrCancelFriendRequestDto,
  ) {
    const user = getUserFromRequest(request);
    await this.friendsService.declineOrCancelFriendRequest(user._id, declineOrCancelFriendRequestDto.userId);
  }

  @Post('requests/accept')
  async acceptFriendRequest(
    @Req() request: Request,
    @Body() acceptFriendRequestDto: AcceptFriendRequestDto,
  ) {
    const user = getUserFromRequest(request);
    const acceptFriendRequestDetails = await this.friendsService.acceptFriendRequest(acceptFriendRequestDto.userId, user._id);
    return acceptFriendRequestDetails;
  }
}
