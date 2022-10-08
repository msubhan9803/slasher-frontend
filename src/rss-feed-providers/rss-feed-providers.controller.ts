import {
  Controller, Get, HttpException, HttpStatus, Param, Query, ValidationPipe,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { ValidateAllRssFeedProvidersDto } from './dto/all-rss-feed-providers.dto';
import { RssFeedProvidersIdDto } from './dto/rss-feed-providers.id.dto';
import { RssFeedProvidersService } from './providers/rss-feed-providers.service';

@Controller('rss-feed-providers')
export class RssFeedProvidersController {
  constructor(private readonly rssFeedProvidersService: RssFeedProvidersService) { }

  @Get(':id')
  async findOne(@Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: RssFeedProvidersIdDto) {
    const rssFeedProvidersData = await this.rssFeedProvidersService.findById(params.id, true);
    if (!rssFeedProvidersData) {
      throw new HttpException('RssFeedProviders not found', HttpStatus.NOT_FOUND);
    }
    return rssFeedProvidersData;
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: ValidateAllRssFeedProvidersDto,
  ) {
    const eventData = await this.rssFeedProvidersService.findAll(
      query.limit,
      true,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
    );
    return eventData;
  }
}
