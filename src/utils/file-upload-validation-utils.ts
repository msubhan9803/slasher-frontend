import { ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { unlink } from 'fs';
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

// TODO: TO BE DELETED
export async function asyncDeleteMulterFiles(files: Express.Multer.File[]) {
  files.forEach((f) => {
    unlink(f.path, (err) => {
      // eslint-disable-next-line no-console
      if (err) { console.log(`Error encountered while trying to delete multer upload file at: ${f.path} -- ${err.message}`); }
    });
  });
}

export async function asyncDeleteMulterFilesNew(files: string[]) {
  files.forEach((path) => {
    unlink(path, (err) => {
      // eslint-disable-next-line no-console
      if (err) { console.log(`Error encountered while trying to delete multer upload file at: ${path} -- ${err.message}`); }
    });
  });
}
