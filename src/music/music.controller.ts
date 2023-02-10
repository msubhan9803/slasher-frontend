import {
    Controller, Get, HttpException, HttpStatus,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { MusicService } from './providers/music.service';

  @Controller('music')
  export class MusicController {
    constructor(
      private readonly musicService: MusicService,
      private configService: ConfigService,
    ) { }

    @Get()
    async findAll() {
      const music = await this.musicService.findAll();
      if (!music) {
        throw new HttpException('No music found', HttpStatus.NOT_FOUND);
      }
      return music;
    }
  }
