import {
  Body,
  Controller, Get, HttpException, HttpStatus, Param, Patch, Post, Query, Req, UploadedFiles, UseInterceptors, ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import mongoose from 'mongoose';
import { LocalStorageService } from '../local-storage/providers/local-storage.service';
import { S3StorageService } from '../local-storage/providers/s3-storage.service';
import { getUserFromRequest } from '../utils/request-utils';
import { UpdateEventDto } from './dto/update-event-dto';
import { EventService } from './providers/events.service';
import { Event } from '../schemas/event/event.schema';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { ValidateEventIdDto } from './dto/validate-event-id.dto';
import { pick } from '../utils/object-utils';
import { ValidateAllEventDto } from './dto/validate-all-event.dto';
import { MAXIMUM_IMAGE_UPLOAD_SIZE, MAX_ALLOWED_UPLOAD_FILES_FOR_EVENT, UPLOAD_PARAM_NAME_FOR_FILES } from '../constants';
import { ValidateAllEventCountsDto } from './dto/validate-all-event-counts.dto';
import { TransformImageUrls } from '../app/decorators/transform-image-urls.decorator';
import { StorageLocationService } from '../global/providers/storage-location.service';
import { CreateEventDto } from './dto/create-event-dto';
import { UserType } from '../schemas/user/user.enums';
import { relativeToFullImagePath } from '../utils/image-utils';
import { defaultFileInterceptorFileFilter } from '../utils/file-upload-utils';
import { generateFileUploadInterceptors } from '../app/interceptors/file-upload-interceptors';
import { ValidateAllEventDistanceDto } from './dto/validate-all-event-by-distance.dto';
import { ValidateAllEventsByRectangularAreaDto } from './dto/validate-all-event-by-rectangular-area.dto';
import { MailService } from '../providers/mail.service';
import { EventCategoriesService } from '../event-categories/providers/event-categories.service';

@Controller({ path: 'events', version: ['1'] })
export class EventsController {
  constructor(
    private readonly eventService: EventService,
    private readonly eventCategoriesService: EventCategoriesService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
    private readonly localStorageService: LocalStorageService,
    private readonly s3StorageService: S3StorageService,
    private readonly storageLocationService: StorageLocationService,
  ) { }

  @Post()
  @UseInterceptors(
    ...generateFileUploadInterceptors(UPLOAD_PARAM_NAME_FOR_FILES, MAX_ALLOWED_UPLOAD_FILES_FOR_EVENT, MAXIMUM_IMAGE_UPLOAD_SIZE, {
      fileFilter: defaultFileInterceptorFileFilter,
      }),
  )
  async createEvent(
    @Req() request: Request,
    @Body() createEventDto: CreateEventDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const user = getUserFromRequest(request);

    // Verify that the event category is valid
    const eventCategory = await this.eventCategoriesService.findById(createEventDto.event_type as unknown as string, true);
    if (!eventCategory) {
      throw new HttpException('Invalid event category.', HttpStatus.BAD_REQUEST);
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

    const createEventData = new Event({ ...createEventDto, userId: user.id });
    createEventData.images = images;
    const event = await this.eventService.create(createEventData);

    this.mailService.sendEventSuggestionEmails(user.email, eventCategory.event_name, event.name, event.startDate, event.endDate);

    const pickEventFields = [
      '_id', 'name', 'userId',
      'images', 'startDate', 'endDate',
      'event_type', 'city',
      'state', 'address', 'country',
      'url', 'event_info',
    ];
    return pick(event, pickEventFields);
  }

  @TransformImageUrls('$[*].images[*]')
  @Get('by-date-range')
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
        ['_id', 'images', 'startDate', 'endDate', 'event_type', 'city', 'state', 'address', 'country', 'name'],
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

  @TransformImageUrls('$[*].images[*]')
  @Get('by-distance')
  async getEventsByDistance(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: ValidateAllEventDistanceDto,
  ) {
    const eventData = await this.eventService.findAllByDistance(
      query.latitude,
      query.longitude,
      query.maxDistanceMiles,
      false,
    );
    eventData.forEach((event) => {
      if (event.images.length === 0) {
        event.images.push(relativeToFullImagePath(this.config, '/placeholders/no_image_available.png'));
      }
    });
    return eventData.map(
      (event) => pick(
        event,
        [
          '_id', 'images', 'startDate', 'endDate', 'event_type', 'city', 'state', 'address',
          'country', 'location', 'distance', 'name',
        ],
      ),
    );
  }

  @TransformImageUrls('$[*].images[*]')
  @Get('by-rectangular-area')
  async findAllInRectangle(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: ValidateAllEventsByRectangularAreaDto,
  ) {
    const eventData = await this.eventService.findAllInRectangle(
      query.latitudeTopRight,
      query.longitudeTopRight,
      query.latitudeBottomLeft,
      query.longitudeBottomLeft,
      false,
    );
    eventData.forEach((event) => {
      if (event.images.length === 0) {
        event.images.push(relativeToFullImagePath(this.config, '/placeholders/no_image_available.png'));
      }
    });
    return eventData.map(
      (event) => pick(
        event,
        [
          '_id', 'images', 'startDate', 'endDate', 'event_type', 'city', 'state', 'address',
          'country', 'location', 'name',
        ],
      ),
    );
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
      'url', 'event_info', 'name',
    ];
    return pick(eventData, pickConversationFields);
  }

  @Patch(':id')
  async update(
    @Req() request: Request,
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: ValidateEventIdDto,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const user = getUserFromRequest(request);

    // For now, only admins can edit events
    if (user.userType !== UserType.Admin) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const eventData = await this.eventService.update(params.id, updateEventDto);
    return {
      _id: eventData.id,
      ...pick(eventData, Object.keys(updateEventDto)),
    };
  }
}
