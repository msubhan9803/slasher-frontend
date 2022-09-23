import {
  Controller, Get, HttpException, HttpStatus, Param, Res, ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import * as mime from 'mime-types';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { LocationParamDto } from './dto/location-param.dto';
import { LocalStorageService } from './providers/local-storage.service';

@Controller('local-storage')
export class LocalStorageController {
  constructor(private readonly localStorageService: LocalStorageService) { }

  @Get(':location(*)')
  async getFile(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    param: LocationParamDto,
    @Res() res: Response,
  ) {
    const filePath = await this.localStorageService.getLocalFilePath(`/${param.location}`);
    if (!filePath) throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    res.setHeader('Content-Type', mime.lookup(filePath) || 'application/octet-stream');
    const file = createReadStream(filePath);
    file.pipe(res);
  }
}
