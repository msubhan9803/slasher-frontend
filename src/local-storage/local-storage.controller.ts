import {
  Controller, Get, HttpException, HttpStatus, Param, Res, ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { InvalidPathError } from '../errors';
import { fileNameToMimeType } from '../utils/mime-utils';
import { defaultQueryDtoValidationPipeOptions } from '../utils/validation-utils';
import { GetFileDto } from './dto/getFile.dto';
import { LocalStorageService } from './providers/local-storage.service';
import { Public } from '../app/guards/auth.guard';

@Controller({ path: 'local-storage', version: ['1'] })
export class LocalStorageController {
  constructor(private readonly localStorageService: LocalStorageService) { }

  @Get(':location(*)')
  @Public()
  async getFile(
    @Param(new ValidationPipe(defaultQueryDtoValidationPipeOptions))
    params: GetFileDto,
    @Res() res: Response,
  ) {
    let filePath;
    try {
      filePath = await this.localStorageService.getLocalFilePath(`/${params.location}`);
    } catch (e) {
      if (e instanceof InvalidPathError) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }
      throw e;
    }
    if (!filePath) { throw new HttpException('File not found', HttpStatus.NOT_FOUND); }
    res.setHeader('Content-Type', fileNameToMimeType(filePath));
    const file = createReadStream(filePath);
    file.pipe(res);
  }
}
