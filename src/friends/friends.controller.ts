import {
  Controller, Post, Req, Body, Get,
  Delete, ValidationPipe, Query,
} from '@nestjs/common';
import { Request } from 'express';
import { getUserFromRequest } from '../utils/request-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { AcceptFriendRequestDto } from './dto/accept-friend-request-dto';
import { CreateFriendRequestDto } from './dto/create-friend-request-dto';
import { DeclineOrCancelFriendRequestDto } from './dto/decline-or-cancel-friend-request-dto';
import { GetFriendsDto } from './dto/get-friends.dto';
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

  @Get('requests/sent')
  async getPendingSentFriendRequests(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: LimitOffSetDto,
) {
    const user = getUserFromRequest(request);
    const friends = await this.friendsService.getSentFriendRequests(user._id, query.limit, query.offset);
    return friends;
  }

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

  @Get()
  async getFriends(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: GetFriendsDto,
) {
    const user = getUserFromRequest(request);
    const friends = await this.friendsService.getFriends(user._id, query.limit, query.offset, query.userNameContains);
    return friends;
  }

  @Post('requests/accept')
  async acceptFriendRequest(
    @Req() request: Request,
    @Body() acceptFriendRequestDto: AcceptFriendRequestDto,
  ) {
    const user = getUserFromRequest(request);
    const acceptFriendRequestDetails = await this.friendsService.acceptFriendRequest(user._id, acceptFriendRequestDto.userId);
    return acceptFriendRequestDetails;
  }
}
