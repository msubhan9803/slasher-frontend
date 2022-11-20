import {
  Controller, Post, Req, Body, Query, Delete, ValidationPipe, Get,
} from '@nestjs/common';
import { Request } from 'express';
import { getUserFromRequest } from '../utils/request-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { BlocksService } from './providers/blocks.service';
import { FriendsService } from '../friends/providers/friends.service';
import { CreateBlockDto } from './dto/create-lock.dto';
import { DeleteBlockQueryDto } from './dto/delete.block.query.dto';
import { BlocksLimitOffSetDto } from './dto/blocks-limit-offset.dto';

@Controller('blocks')
export class BlocksController {
  constructor(
    private readonly blocksService: BlocksService,
    private readonly friendsService: FriendsService,
  ) { }

  @Post()
  async createBlock(@Req() request: Request, @Body() createBlockDto: CreateBlockDto) {
    const user = getUserFromRequest(request);
    await this.blocksService.createBlock(user._id, createBlockDto.userId);
    await this.friendsService.cancelFriendshipOrDeclineRequest(user._id, createBlockDto.userId);
    return { success: true };
  }

  @Delete()
  async deleteBlock(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) deleteBlockQueryDto: DeleteBlockQueryDto,
  ) {
    const user = getUserFromRequest(request);
    await this.blocksService.deleteBlock(user._id, deleteBlockQueryDto.userId);
    return { success: true };
  }

  @Get()
  async getBlockedUsers(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: BlocksLimitOffSetDto,
  ) {
    const user = getUserFromRequest(request);
    return this.blocksService.getBlockedUsersBySender(user._id, query.limit, query.offset);
  }
}
