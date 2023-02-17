import {
  Controller, Get, HttpException, HttpStatus, Param, Res, ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { fileNameToMimeType } from '../utils/mime-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { GetFileDto } from './dto/getFile.dto';
import { LocalStorageService } from './providers/local-storage.service';

@Controller({ path: 'local-storage', version: ['1'] })
export class LocalStorageController {
  constructor(private readonly localStorageService: LocalStorageService) { }

  @Get(':location(*)')
  async getFile(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    params: GetFileDto,
    @Res() res: Response,
  ) {
    const filePath = await this.localStorageService.getLocalFilePath(`/${params.location}`);
    if (!filePath) { throw new HttpException('File not found', HttpStatus.NOT_FOUND); }
    res.setHeader('Content-Type', fileNameToMimeType(filePath));
    const file = createReadStream(filePath);
    file.pipe(res);
  }
}
