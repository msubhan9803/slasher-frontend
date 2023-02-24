import { Controller, Get } from '@nestjs/common';
import { pick } from '../utils/object-utils';
import { MusicService } from './providers/music.service';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get()
  async index() {
    const music = await this.musicService.findAll(true);
    return music.map((musicData) => pick(musicData, ['_id', 'name']));
  }
}
