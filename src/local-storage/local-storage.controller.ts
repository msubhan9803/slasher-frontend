import {
  Controller, Get, HttpException, HttpStatus, Query, Res, ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { LocationQueryDto } from './dto/location-query.dto';
import { LocalStorageService } from './providers/local-storage.service';

@Controller('local-storage')
export class LocalStorageController {
  constructor(private readonly localStorageService: LocalStorageService) { }

  @Get()
  async getFile(
    @Query(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    query: LocationQueryDto,
    @Res() res: Response,
  ) {
    const filePath = await this.localStorageService.getLocalFilePath(query.location);

    if (!filePath) throw new HttpException('File not found', HttpStatus.NOT_FOUND);

    const file = createReadStream(filePath);
    file.pipe(res);
  }
}
