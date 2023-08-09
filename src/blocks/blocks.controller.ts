import {
  Controller, Post, Req, Body, Query, Delete, ValidationPipe, Get,
} from '@nestjs/common';
import { Request } from 'express';
import mongoose from 'mongoose';
import { getUserFromRequest } from '../utils/request-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { BlocksService } from './providers/blocks.service';
import { FriendsService } from '../friends/providers/friends.service';
import { ChatService } from '../chat/providers/chat.service';
import { CreateBlockDto } from './dto/create-lock.dto';
import { DeleteBlockQueryDto } from './dto/delete.block.query.dto';
import { BlocksLimitOffSetDto } from './dto/blocks-limit-offset.dto';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { FriendRequestReaction } from '../schemas/friend/friend.enums';
import { FriendsGateway } from '../friends/providers/friends.gateway';

@Controller({ path: 'blocks', version: ['1'] }) export class BlocksController {
  constructor(
    private readonly blocksService: BlocksService,
    private readonly friendsService: FriendsService,
    private readonly chatService: ChatService,
    private friendsGateway: FriendsGateway,

  ) { }

  @Post()
  async createBlock(@Req() request: Request, @Body() createBlockDto: CreateBlockDto) {
    const user = getUserFromRequest(request);

    const friendship = await this.friendsService.findFriendship(user.id, createBlockDto.userId);
    if (friendship && friendship.reaction === FriendRequestReaction.Pending) {
      await this.friendsGateway.emitFriendRequestReceivedEvent(friendship.to.toString(), friendship.from.toString());
    }
    await this.blocksService.createBlock(user.id, createBlockDto.userId);
    await this.friendsService.cancelFriendshipOrDeclineRequest(user.id, createBlockDto.userId);
    await this.chatService.deletePrivateDirectMessageConversations(user.id, createBlockDto.userId);
    await this.chatService.deletePrivateDirectMessageConversation([
      new mongoose.Types.ObjectId(user.id),
      new mongoose.Types.ObjectId(createBlockDto.userId),
    ]);
    return { success: true };
  }

  @Delete()
  async deleteBlock(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) deleteBlockQueryDto: DeleteBlockQueryDto,
  ) {
    const user = getUserFromRequest(request);
    await this.blocksService.deleteBlock(user.id, deleteBlockQueryDto.userId);
    return { success: true };
  }

  @TransformImageUrls('$[*].profilePic')
  @Get()
  async getBlockedUsers(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: BlocksLimitOffSetDto,
  ) {
    const user = getUserFromRequest(request);
    return this.blocksService.getBlockedUsersBySender(user.id, query.limit, query.offset);
  }
}
