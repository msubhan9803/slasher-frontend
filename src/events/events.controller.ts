import {
  Body,
  Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Query, Req, UploadedFiles, UseInterceptors, ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { getUserFromRequest } from '../utils/request-utils';
import { CreateOrUpdateEventDto } from './dto/create-or-update-event.dto';
import { EventService } from './providers/events.service';
import { Event } from '../schemas/event/event.schema';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { ValidateEventIdDto } from './dto/validate-event-id.dto';
import { pick } from '../utils/object-utils';
import { ValidateAllEventDto } from './dto/validate-all-event.dto';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventService: EventService,
    private readonly config: ConfigService,
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
  ) { }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      fileFilter: (req, file, cb) => {
        if (
          !file.mimetype.includes('image/png')
          && !file.mimetype.includes('image/jpeg')
        ) {
          return cb(new HttpException(
            'Invalid file type',
            HttpStatus.BAD_REQUEST,
          ), false);
        }
        return cb(null, true);
      },
      limits: {
        fileSize: 20000000, // size in bytes, 20MB
      },
    }),
  )
  async createEvent(
    @Req() request: Request,
    @Body() createEventDto: CreateOrUpdateEventDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const user = getUserFromRequest(request);

    if (!files.length) {
      throw new HttpException(
        'Please upload a file',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (files.length > 4) {
      throw new HttpException(
        'Only allow a maximum of 4 images',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!createEventDto.name) {
      throw new HttpException('name should not be empty', HttpStatus.BAD_REQUEST);
    }

    if (user.id !== createEventDto.userId) {
      throw new HttpException('You are not allowed to do this action', HttpStatus.FORBIDDEN);
    }

    if (!createEventDto.startDate) {
      throw new HttpException('startDate should not be empty', HttpStatus.BAD_REQUEST);
    }

    if (!createEventDto.endDate) {
      throw new HttpException('endDate should not be empty', HttpStatus.BAD_REQUEST);
    }

    if (!createEventDto.country) {
      throw new HttpException('country should not be empty', HttpStatus.BAD_REQUEST);
    }

    if (!createEventDto.state) {
      throw new HttpException('state should not be empty', HttpStatus.BAD_REQUEST);
    }

    if (!createEventDto.city) {
      throw new HttpException('city should not be empty', HttpStatus.BAD_REQUEST);
    }

    if (!createEventDto.event_info) {
      throw new HttpException('event_info should not be empty', HttpStatus.BAD_REQUEST);
    }

    const images = [];
    for (const file of files) {
      const storageLocation = `feedPost/feedPost_${file.filename}`;
      if (this.config.get<string>('FILE_STORAGE') === 's3') {
        const s3hostUrl = `${this.config.get<string>('S3_HOST')}/feedPost/feedPost_${file.filename}`;
        await this.s3StorageService.write(storageLocation, file);
        images.push({ image_path: s3hostUrl });
      } else {
        this.localStorageService.write(storageLocation, file);
        const localhostUrl = this.localStorageService.getLocalFilePath(`/${storageLocation}`);
        images.push({ image_path: localhostUrl });
      }
    }

    const createEventData = new Event(createEventDto);
    createEventData.images = images;
    const event = await this.eventService.create(createEventData);
    return event;
  }

  @Get(':id')
  async getById(@Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateEventIdDto) {
    const eventData = await this.eventService.findById(params.id, true);

    if (!eventData) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }
    return eventData;
  }

  @Patch(':id')
  async update(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateEventIdDto,
    @Body() updateEventDto: CreateOrUpdateEventDto,
  ) {
    const eventData = await this.eventService.update(params.id, updateEventDto);
    return {
      id: eventData.id,
      ...pick(eventData, Object.keys(updateEventDto)),
    };
  }

  @Get()
  async getAllEvent(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: ValidateAllEventDto,
  ) {
    const eventData = await this.eventService.findAllByDate(query.startDate, query.endDate, query.limit, true);
    return eventData;
  }
}
