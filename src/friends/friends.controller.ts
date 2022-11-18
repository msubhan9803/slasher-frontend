import {
  Controller, Post, Req, Body, Get,
  Delete, ValidationPipe, Query, HttpException, HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { getUserFromRequest } from '../utils/request-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { AcceptFriendRequestDto } from './dto/accept-friend-request.dto';
import { BlockSuggestedFriendDto } from './dto/block-suggest-friend.dto';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { CancelFriendshipOrDeclineRequestDto } from './dto/decline-or-cancel-friend-request.dto';
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
  async cancelFriendshipOrDeclineRequest(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    cancelFriendshipOrDeclineRequestDto: CancelFriendshipOrDeclineRequestDto,
  ) {
    const user = getUserFromRequest(request);
    await this.friendsService.cancelFriendshipOrDeclineRequest(user._id, cancelFriendshipOrDeclineRequestDto.userId);
  }

  @Post('requests/accept')
  async acceptFriendRequest(
    @Req() request: Request,
    @Body() acceptFriendRequestDto: AcceptFriendRequestDto,
  ) {
    try {
      const user = getUserFromRequest(request);
      const acceptFriendRequestDetails = await this.friendsService.acceptFriendRequest(acceptFriendRequestDto.userId, user._id);
      return acceptFriendRequestDetails;
    } catch (error) {
      throw new HttpException('Unable to accept friend request', HttpStatus.BAD_REQUEST);
    }
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
