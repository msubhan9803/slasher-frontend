import {
 Controller, Get, HttpException, HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArtistsService } from './providers/artists.service';

@Controller('artists')
export class ArtistsController {
  constructor(
    private readonly artistsService: ArtistsService,
    private configService: ConfigService,
  ) {}

  @Get()
  async findAll() {
    const artists = await this.artistsService.findAll();
    if (!artists) {
      throw new HttpException('No Artists found', HttpStatus.NOT_FOUND);
    }
    return artists;
  }
}
