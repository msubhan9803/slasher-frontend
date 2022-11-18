import {
  Controller, Req, Get, ValidationPipe, Query,
} from '@nestjs/common';
import { Request } from 'express';
import { getUserFromRequest } from '../utils/request-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { ChatService } from './providers/chat.service';
import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) { }

  @Get('conversations')
  async getConversations(
    @Req() request: Request,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: GetConversationsQueryDto,
  ) {
    const user = getUserFromRequest(request);
    const conversations = await this.chatService.getConversations(user.id, query.limit, query.before);

    return conversations;
  }
}
