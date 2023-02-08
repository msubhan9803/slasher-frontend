import {
  Controller, Req, Get, ValidationPipe, Query, Param, HttpException, HttpStatus, Post, Body, Patch, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { Request } from 'express';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { getUserFromRequest } from '../utils/request-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { ChatService } from './providers/chat.service';
import { GetConversationsQueryDto } from './dto/get-conversations-query.dto';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { GetConversationQueryDto } from './dto/get-conversation-query.dto';
import { CreateOrFindConversationQueryDto } from './dto/create-or-find-conversation-query.dto';
import { pick } from '../utils/object-utils';
import { MarkConversationReadDto } from './dto/mark-conversation-read.dto';
import { User } from '../schemas/user/user.schema';
import { FriendsService } from '../friends/providers/friends.service';
import { BlocksService } from '../blocks/providers/blocks.service';
import { MAXIMUM_IMAGE_UPLOAD_SIZE, UNREAD_MESSAGE_NOTIFICATION_DELAY } from '../constants';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { StorageLocationService } from '../global/providers/storage-location.service';
import { SendMessageInConversationParamsDto } from './dto/send-message-in-conversation-params-dto';
import { SendMessageInConversationDto } from './dto/send-message-in-conversation-dto';
import { ChatGateway } from './providers/chat.gateway';
import { defaultFileInterceptorFileFilter } from '../utils/file-upload-validation-utils';

@Controller('chat')
export class ChatController {
  constructor(
    @InjectQueue('message-count-update') private messageCountUpdateQueue: Queue,
    private readonly chatService: ChatService,
    private readonly friendsService: FriendsService,
    private readonly blocksService: BlocksService,
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
    private readonly storageLocationService: StorageLocationService,
    private readonly config: ConfigService,
    private readonly chatGateway: ChatGateway,
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
    const matchList = await this.chatService.findMatchList(param.matchListId, true);
    if (!matchList) {
      throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
    }
    const matchUserIds = matchList.participants.filter((userId) => (userId as any)._id.toString() === user.id);
    if (!matchUserIds.length) {
      throw new HttpException('You are not a member of this conversation', HttpStatus.UNAUTHORIZED);
    }
    const pickConversationFields = ['_id', 'participants'];

    return pick(matchList, pickConversationFields);
  }

  @Post('conversations/create-or-find-direct-message-conversation')
  async createOrFindDirectMessageConversation(
    @Req() request: Request,
    @Body() createOrFindConversationQueryDto: CreateOrFindConversationQueryDto,
  ) {
    const user = getUserFromRequest(request);
    const block = await this.blocksService.blockExistsBetweenUsers(user.id, createOrFindConversationQueryDto.userId);
    if (block) {
      throw new HttpException('Request failed due to user block.', HttpStatus.BAD_REQUEST);
    }
    const areFriends = await this.friendsService.areFriends(user._id, createOrFindConversationQueryDto.userId);
    if (!areFriends) {
      throw new HttpException('You are not friends with this user.', HttpStatus.UNAUTHORIZED);
    }
    const chat = await this.chatService.createOrFindPrivateDirectMessageConversationByParticipants([
      user._id,
      new mongoose.Types.ObjectId(createOrFindConversationQueryDto.userId),
    ]);
    const pickConversationFields = ['_id', 'participants'];

    return pick(chat, pickConversationFields);
  }

  @Patch('conversations/mark-all-received-messages-read-for-chat/:matchListId')
  async markAllAsReadFromUser(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) param: MarkConversationReadDto,
  ) {
    const user = getUserFromRequest(request);
    const matchList = await this.chatService.findMatchList(param.matchListId, true);
    if (!matchList) throw new HttpException('Not found', HttpStatus.NOT_FOUND);

    const matchUserIds = (matchList.participants as unknown as User[]).filter(
      (participantUser) => participantUser._id.toString() === user.id,
    );

    if (!matchUserIds.length) {
      throw new HttpException('You are not a member of this conversation', HttpStatus.UNAUTHORIZED);
    }

    await this.chatService.markAllReceivedMessagesReadForChat(user.id, param.matchListId);
    return { success: true };
  }

  @TransformImageUrls('$.messages[*].image')
  @Post('conversation/:matchListId/message')
  @UseInterceptors(
    FilesInterceptor('files', 11, {
      fileFilter: defaultFileInterceptorFileFilter,
      limits: {
        fileSize: MAXIMUM_IMAGE_UPLOAD_SIZE,
      },
    }),
  )
  async sendMessageInConversation(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: SendMessageInConversationParamsDto,
    @Body() messageDto: SendMessageInConversationDto,
  ) {
    if (files.length > 10) {
      throw new HttpException(
        'Only allow a maximum of 10 images',
        HttpStatus.BAD_REQUEST,
      );
    }
    const matchList = await this.chatService.findMatchList(params.matchListId, false);
    if (!matchList) {
      throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
    }
    const user = getUserFromRequest(request);

    const validateUser = matchList.participants.find((userId) => (userId as unknown as User)._id.toString() === user.id);
    if (!validateUser) {
      throw new HttpException('You are not a member of this conversation', HttpStatus.UNAUTHORIZED);
    }

    const toUserId = matchList.participants.find((userId) => (userId as any)._id.toString() !== user.id);

    const areFriends = await this.friendsService.areFriends(user._id, toUserId.id);
    if (!areFriends) {
      throw new HttpException('You are not friends with the given user.', HttpStatus.UNAUTHORIZED);
    }

    const images = [];
    for (const file of files) {
      const storageLocation = this.storageLocationService.generateNewStorageLocationFor('chat', file.filename);
      if (this.config.get<string>('FILE_STORAGE') === 's3') {
        await this.s3StorageService.write(storageLocation, file);
      } else {
        this.localStorageService.write(storageLocation, file);
      }
      images.push({ image_path: storageLocation });
    }

    const newMessages = [];
    for (const image of images) {
      newMessages.push(await this.chatService.sendPrivateDirectMessage(user.id, toUserId.id, '', image.image_path));
    }
    if (messageDto.message) {
      newMessages.push(await this.chatService.sendPrivateDirectMessage(user.id, toUserId.id, messageDto.message));
    }
    if (newMessages.length > 0) {
      await this.chatGateway.emitMessageForConversation(newMessages, toUserId.id);

      await this.messageCountUpdateQueue.add(
        'send-update-if-message-unread',
        { messageId: newMessages[newMessages.length - 1].id },
        { delay: UNREAD_MESSAGE_NOTIFICATION_DELAY }, // 15 second delay
      );
    }

    return {
      messages: newMessages.map(
        (message) => pick(
          message,
          ['_id', 'image', 'message', 'fromId', 'senderId', 'matchId', 'createdAt', 'messageType', 'isRead', 'status', 'deleted'],
        ),
      ),
    };
  }
}
