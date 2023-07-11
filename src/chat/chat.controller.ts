import {
  Controller, Req, Get, ValidationPipe, Query, Param, HttpException, HttpStatus, Post, Body, Patch, UseInterceptors, UploadedFiles, Delete,
} from '@nestjs/common';
import { Request } from 'express';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
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
import {
  MAXIMUM_IMAGE_UPLOAD_SIZE, MAX_ALLOWED_UPLOAD_FILES_FOR_CHAT,
  UNREAD_MESSAGE_NOTIFICATION_DELAY, UPLOAD_PARAM_NAME_FOR_FILES,
} from '../constants';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { StorageLocationService } from '../global/providers/storage-location.service';
import { SendMessageInConversationParamsDto } from './dto/send-message-in-conversation-params-dto';
import { SendMessageInConversationDto } from './dto/send-message-in-conversation-dto';
import { ChatGateway } from './providers/chat.gateway';
import { defaultFileInterceptorFileFilter } from '../utils/file-upload-utils';
import { generateFileUploadInterceptors } from '../app/interceptors/file-upload-interceptors';
import { UsersService } from '../users/providers/users.service';
import { GetConversationMessagesQueryDto } from './dto/get-conversation-messages-query.dto';
import { GetConversationMessagesParamsDto } from './dto/get-conversation-messages-params.dto';

@Controller({ path: 'chat', version: ['1'] })
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
    private readonly usersService: UsersService,
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
      throw new HttpException('Request failed due to user block.', HttpStatus.FORBIDDEN);
    }
    const areFriends = await this.friendsService.areFriends(user.id, createOrFindConversationQueryDto.userId);
    if (!areFriends) {
      throw new HttpException('You must be friends with this user to perform this action.', HttpStatus.UNAUTHORIZED);
    }
    const chat = await this.chatService.createOrFindPrivateDirectMessageConversationByParticipants([
      new mongoose.Types.ObjectId(user.id),
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
    if (!matchList) { throw new HttpException('Not found', HttpStatus.NOT_FOUND); }

    const matchUserIds = (matchList.participants as unknown as User[]).filter(
      (participantUser) => participantUser._id.toString() === user.id,
    );

    if (!matchUserIds.length) {
      throw new HttpException('You are not a member of this conversation', HttpStatus.UNAUTHORIZED);
    }
    const userData = await this.usersService.removeAndUpdateNewConversationId(user.id, param.matchListId);

    await Promise.all([
      this.chatGateway.emitConversationCountUpdateEvent(userData.id),
      this.chatService.markAllReceivedMessagesReadForChat(user.id, param.matchListId),
    ]);
    return { success: true };
  }

  @TransformImageUrls('$.messages[*].image', '$.messages[*].urls[*]')
  @Post('conversation/:matchListId/message')
  @UseInterceptors(
    ...generateFileUploadInterceptors(UPLOAD_PARAM_NAME_FOR_FILES, MAX_ALLOWED_UPLOAD_FILES_FOR_CHAT, MAXIMUM_IMAGE_UPLOAD_SIZE, {
      fileFilter: defaultFileInterceptorFileFilter,
      }),
  )
  async sendMessageInConversation(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: SendMessageInConversationParamsDto,
    @Body() messageDto: SendMessageInConversationDto,
  ) {
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

    const areFriends = await this.friendsService.areFriends(user.id, toUserId.id);
    if (!areFriends) {
      throw new HttpException('You are not friends with the given user.', HttpStatus.UNAUTHORIZED);
    }

    if (files && files.length && files?.length !== messageDto.imageDescriptions?.length) {
      throw new HttpException(
        'files length and imagesDescriptions length should be same',
        HttpStatus.BAD_REQUEST,
      );
    }

    const images = [];
    for (const [index, file] of files.entries()) {
      const storageLocation = this.storageLocationService.generateNewStorageLocationFor('chat', file.filename);
      if (this.config.get<string>('FILE_STORAGE') === 's3') {
        await this.s3StorageService.write(storageLocation, file);
      } else {
        this.localStorageService.write(storageLocation, file);
      }
      const description = messageDto?.imageDescriptions[index].description;
      const imageDescription = description === '' ? null : description;
      images.push({ image_path: storageLocation, description: imageDescription });
    }

    const newMessages = [];
    for (const image of images) {
      newMessages.push(await this.chatService.sendPrivateDirectMessage(user.id, toUserId.id, '', image.image_path, image.description));
    }
    if (messageDto.message) {
      // TODO: Remove use of encodeURIComponent below once the old Slasher iOS/Android apps are retired
      // AND all old messages have been updated so that they're not being URI-encoded anymore.
      // The URI-encoding is coming from the old API or more likely the iOS and Android apps.
      // For some reason, the old apps will crash on a message page if the messages are not
      // url-encoded (we saw this while Damon was testing on Android).
      const urlEncodedMessage = encodeURIComponent(messageDto.message);
      newMessages.push(await this.chatService.sendPrivateDirectMessage(user.id, toUserId.id, urlEncodedMessage));
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
          [
            '_id', 'imageDescription', 'image', 'urls', 'message', 'fromId',
            'senderId', 'matchId', 'createdAt', 'messageType', 'isRead',
            'status', 'deleted',
          ],
        ),
      ),
    };
  }

  @Delete('conversation/:matchListId')
  async deleteConversationMessages(
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

    await this.chatService.deleteConversationMessages(user.id, param.matchListId);
    return { success: true };
  }

  @Get('conversation/:matchListId/messages')
  @TransformImageUrls('$[*].image', '$[*].urls[*]')
  async getConversationMessages(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) param: GetConversationMessagesParamsDto,
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) query: GetConversationMessagesQueryDto,
  ) {
    const user = getUserFromRequest(request);
    const matchList = await this.chatService.findMatchList(param.matchListId, true);

    if (!matchList) {
      throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND);
    }

    const matchUserIds = matchList.participants.find(
      (participant) => (participant as any)._id.toString() === user.id,
    );
    if (!matchUserIds) {
      throw new HttpException('You are not a member of this conversation', HttpStatus.UNAUTHORIZED);
    }

    // If `before` param is undefined, mark all of this conversation's messages TO this user as read,
    // since the user is requesting the LATEST messages in the chat and will then be caught up.
    if (!query.before) {
      await this.chatService.markAllReceivedMessagesReadForChat(user.id, matchList.id);
      await this.chatGateway.emitConversationCountUpdateEvent(user.id);
    }

    const messages = await this.chatService.getMessages(matchList.id, user.id, query.limit, query.before);
    return messages.map(
      (message) => pick(message, ['_id', 'message', 'isRead', 'imageDescription', 'createdAt', 'image', 'urls', 'fromId', 'senderId']),
    );
  }
}
