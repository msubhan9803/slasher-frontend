import { Controller, Get } from '@nestjs/common';
import { pick } from '../utils/object-utils';
import { ArtistsService } from './providers/artists.service';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Get()
  async index() {
    const artists = await this.artistsService.findAll(true);
    return artists.map((artistData) => pick(artistData, ['_id', 'name']));
  }
}
