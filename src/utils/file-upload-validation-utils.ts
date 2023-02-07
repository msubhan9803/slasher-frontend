import {
 ParseFilePipeBuilder, HttpStatus, Logger, HttpException,
} from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { MAXIMUM_IMAGE_UPLOAD_SIZE } from '../constants';

// TODO: Change module name to file-upload-utils.ts

export function createProfileOrCoverImageParseFilePipeBuilder() {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: /(jpg|jpeg|png|gif)$/,
    })
    .addMaxSizeValidator({
      maxSize: MAXIMUM_IMAGE_UPLOAD_SIZE,
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });
}

export function defaultFileInterceptorFileFilter(req, file, callback) {
  if (
    !file.mimetype.includes('image/png')
    && !file.mimetype.includes('image/jpeg')
    && !file.mimetype.includes('image/gif')
  ) {
    return callback(new HttpException(
      'Invalid file type',
      HttpStatus.BAD_REQUEST,
    ), false);
  }
  return callback(null, true);
}

export function deleteMulterFiles(files: string[], logger?: Logger) {
  files.forEach((path) => {
    const fileDoesNotExist = !existsSync(path);
    if (fileDoesNotExist) return;

    try {
      unlinkSync(path);
    } catch (err) {
      logger.error(`Encountered an error while deleting Multer temporary upload file at: ${path} -- ${err.message}`);
    }
  });
}
