import {
 Controller, Get, HttpException, HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PodcastsService } from './providers/podcasts.service';

@Controller('podcasts')
export class PodcastsController {
  constructor(
    private readonly podcastsService: PodcastsService,
    private configService: ConfigService,
  ) {}

  @Get()
  async findAll() {
    const podcasts = await this.podcastsService.findAll();
    if (!podcasts) {
      throw new HttpException('No podcasts found', HttpStatus.NOT_FOUND);
    }
    return podcasts;
  }
}
