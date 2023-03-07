import { Controller, Get } from '@nestjs/common';
import { pick } from '../utils/object-utils';
import { PodcastsService } from './providers/podcasts.service';

@Controller({ path: 'podcasts', version: ['1'] })
export class PodcastsController {
  constructor(private readonly podcastsService: PodcastsService) {}

  @Get()
  async index() {
    const podcasts = await this.podcastsService.findAll(true);
    return podcasts.map((podcastData) => pick(podcastData, ['_id', 'name']));
  }
}
