import { ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';

export function createProfileOrCoverImageParseFilePipeBuilder() {
  return new ParseFilePipeBuilder()
    .addFileTypeValidator({
      fileType: /(jpg|jpeg|png)$/,
    })
    .addMaxSizeValidator({
      maxSize: 2e+7,
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });
}
