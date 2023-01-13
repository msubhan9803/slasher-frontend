import {
  Body,
  Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Query, Req, UploadedFiles, UseInterceptors, ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import mongoose from 'mongoose';
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
import { asyncDeleteMulterFiles } from '../utils/file-upload-validation-utils';
import { MAXIMUM_IMAGE_UPLOAD_SIZE } from '../constants';
import { ValidateAllEventCountsDto } from './dto/validate-all-event-counts.dto';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { StorageLocationService } from '../global/providers/storage-location.service';
import { relativeToFullImagePath } from '../utils/image-utils';
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventService: EventService,
    private readonly config: ConfigService,
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
    private readonly storageLocationService: StorageLocationService,
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
        fileSize: MAXIMUM_IMAGE_UPLOAD_SIZE, // size in bytes, 20MB
      },
    }),
  )
  async createEvent(
    @Req() request: Request,
    @Body() createEventDto: CreateOrUpdateEventDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const user = getUserFromRequest(request);

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

    if (!createEventDto.address) {
      throw new HttpException('address should not be empty', HttpStatus.BAD_REQUEST);
    }

    const images = [];
    for (const file of files) {
      const storageLocation = this.storageLocationService.generateNewStorageLocationFor('event', file.filename);
      if (this.config.get<string>('FILE_STORAGE') === 's3') {
        await this.s3StorageService.write(storageLocation, file);
      } else {
        this.localStorageService.write(storageLocation, file);
      }
      images.push(storageLocation);
    }

    const createEventData = new Event(createEventDto);
    createEventData.images = images;
    const event = await this.eventService.create(createEventData);

    asyncDeleteMulterFiles(files);
    const pickConversationFields = [
      '_id', 'name', 'userId',
      'images', 'startDate', 'endDate',
      'event_type', 'city',
      'state', 'address', 'country',
      'url', 'event_info',
    ];
    return pick(event, pickConversationFields);
  }

  @TransformImageUrls('$.images[*]')
  @Get(':id')
  async getById(@Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateEventIdDto) {
    const eventData = await this.eventService.findById(params.id, true, 'event_type', 'event_name');
    if (!eventData) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }
    if (eventData.images.length === 0) {
      // eslint-disable-next-line no-param-reassign
      eventData.images.push(relativeToFullImagePath(this.config, '/placeholders/no_image_available.png'));
    }
    const pickConversationFields = [
      '_id', 'images', 'startDate',
      'endDate', 'event_type', 'city',
      'state', 'address', 'country',
      'url', 'event_info',
    ];
    return pick(eventData, pickConversationFields);
  }

  @Patch(':id')
  async update(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateEventIdDto,
    @Body() updateEventDto: CreateOrUpdateEventDto,
  ) {
    const eventData = await this.eventService.update(params.id, updateEventDto);
    return {
      _id: eventData.id,
      ...pick(eventData, Object.keys(updateEventDto)),
    };
  }

  @TransformImageUrls('$[*].images[*]')
  @Get()
  async getEventsByDateRange(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: ValidateAllEventDto,
  ) {
    const eventData = await this.eventService.findAllByDate(
      query.startDate,
      query.endDate,
      query.limit,
      true,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
    );
    eventData.forEach((event) => {
      if (event.images.length === 0) {
        // eslint-disable-next-line no-param-reassign
        event.images.push(relativeToFullImagePath(this.config, '/placeholders/no_image_available.png'));
      }
    });
    return eventData.map(
      (event) => pick(
        event,
        ['_id', 'images', 'startDate', 'endDate', 'event_type', 'city', 'state', 'address', 'country', 'event_info'],
      ),
    );
  }

  @Get('by-date-range/counts')
  async getEventCountsByDateRange(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: ValidateAllEventCountsDto,
  ) {
    // To prevent abuse, make sure that startDate and endDate aren't more than a certain number of
    // days apart (so someone can't look up an entire year worth of events).
    const daysInMilliseconds = 45 * 86400000;
    if (query.endDate.getTime() - query.startDate.getTime() > daysInMilliseconds) {
      throw new HttpException(
        'Dates are too far apart.  Cannot return results.  Please try again with dates that are closer together.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const eventCounts = await this.eventService.findCountsByDate(
      query.startDate,
      query.endDate,
      true,
    );
    return eventCounts;
  }
}
