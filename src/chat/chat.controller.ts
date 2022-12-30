import {
  Controller, Req, Get, ValidationPipe, Query, Param, HttpException, HttpStatus, Post, Body,
} from '@nestjs/common';
import { Request } from 'express';
import mongoose from 'mongoose';
import { getUserFromRequest } from '../utils/request-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { ChatService } from './providers/chat.service';
import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { GetConversationQueryDto } from './dto/get-conversation-query.dto';
import { CreateOrFindConversationQueryDto } from './dto/create-or-find-conversation-query.dto';
import { pick } from '../utils/object-utils';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) { }

  @TransformImageUrls('$[*].participants[*].profilePic')
  @Get('conversations')
  async getConversations(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: GetConversationsQueryDto,
  ) {
    const user = getUserFromRequest(request);
    const conversations = await this.chatService.getConversations(user.id, query.limit, query.before);
    return conversations;
  }

  @TransformImageUrls('$.participants[*].profilePic')
  @Get('conversation/:matchListId')
  async getConversation(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) param: GetConversationQueryDto,
  ) {
    const user = getUserFromRequest(request);
    const matchList = await this.chatService.findMatchList(param.matchListId);
    if (!matchList) {
      throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
    }
    const matchUserIds = matchList.participants.filter((userId) => userId.id === user.id);
    if (!matchUserIds.length) {
      throw new HttpException('You are not a member of this conversation', HttpStatus.UNAUTHORIZED);
    }
    const pickConversationFields = ['_id', 'participants'];

    return pick(matchList, pickConversationFields);
  }

  @Post('conversations/create-or-find-direct-message-conversation')
  async createOrFindDirectMessageConversation(
    @Req() request: Request,
    @Body() createEventDto: CreateOrFindConversationQueryDto,
  ) {
    const user = getUserFromRequest(request);
    const chat = await this.chatService.createOrFindPrivateDirectMessageConversationByParticipants([
      user._id,
      new mongoose.Types.ObjectId(createEventDto.userId),
    ]);
    const pickConversationFields = ['_id', 'participants'];

    return pick(chat, pickConversationFields);
  }
}
