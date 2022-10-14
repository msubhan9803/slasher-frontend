import { ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { unlink } from 'fs';

// TODO: Change module name to file-upload-utils.ts

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

export async function asyncDeleteMulterFiles(files: Express.Multer.File[]) {
  files.forEach((f) => {
    unlink(f.path, (err) => {
      // eslint-disable-next-line no-console
      if (err) { console.log(`Error encountered while trying to delete multer upload file at: ${f.path} -- ${err.message}`); }
    });
  });
}
