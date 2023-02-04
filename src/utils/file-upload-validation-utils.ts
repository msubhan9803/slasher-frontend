import { ParseFilePipeBuilder, HttpStatus, Logger } from '@nestjs/common';
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
