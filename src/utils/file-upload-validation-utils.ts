import { ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { MAXIMUM_IMAGE_UPLOAD_SIZE } from '../constants';

// TODO: Change module name to file-upload-utils.ts

export function createProfileOrCoverImageParseFilePipeBuilder() {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: /(jpg|jpeg|png)$/,
    })
    .addMaxSizeValidator({
      maxSize: MAXIMUM_IMAGE_UPLOAD_SIZE,
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });
}
