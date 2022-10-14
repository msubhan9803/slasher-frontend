import {
  Controller, Get, HttpException, HttpStatus, Param, Query, ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { relativeToFullImagePath } from '../utils/image-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { ValidateAllRssFeedProvidersDto } from './dto/all-rss-feed-providers.dto';
import { RssFeedProvidersIdDto } from './dto/rss-feed-providers.id.dto';
import { RssFeedProvidersService } from './providers/rss-feed-providers.service';

@Controller('rss-feed-providers')
export class RssFeedProvidersController {
  constructor(private readonly rssFeedProvidersService: RssFeedProvidersService, private readonly config: ConfigService) { }

  @Get(':id')
  async findOne(@Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions)) params: RssFeedProvidersIdDto) {
    const rssFeedProvider = await this.rssFeedProvidersService.findById(params.id, true);
    if (!rssFeedProvider) {
      throw new HttpException('RssFeedProvider not found', HttpStatus.NOT_FOUND);
    }
    rssFeedProvider.logo = relativeToFullImagePath(this.config, rssFeedProvider.logo);
    return rssFeedProvider;
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: ValidateAllRssFeedProvidersDto,
  ) {
    const rssFeedProviders = await this.rssFeedProvidersService.findAll(
      query.limit,
      true,
      query.after ? new mongoose.Types.ObjectId(query.after) : undefined,
    );

    // Convert image relative paths to full paths
    for (const rssFeedProvider of rssFeedProviders) {
      rssFeedProvider.logo = relativeToFullImagePath(this.config, rssFeedProvider.logo);
    }

    return rssFeedProviders;
  }
}
