import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Observable, throwError } from 'rxjs';

/**
 * Meant to be used with a FilesInterceptor, and should always be placed AFTER the FilesInterceptor
 * when used inside a @UseInterceptors() decorator.
 * This interceptor will perform a check before the controller route handler function is called, and
 * also before Multer's maximum file check runs,a nd will throw a more informative error than
 * Multer would have.
 *
 * Note: When using this interceptor, you should apply a limit of Infinity to the FilesInterceptor
 * because if the FilesInterceptor is ever lower than the number of uploaded files, the
 * FilesInterceptor's file count logic will override the error message and return a less informative
 * 'Unexpected field' error.
 *
 * Example usage:
 *
 * @Post()
 * @UseInterceptors(
 *   FilesInterceptor(UPLOAD_PARAM_NAME_FOR_FILES, Infinity, {
 *     fileFilter: defaultFileInterceptorFileFilter,
 *     limits: { fileSize: MAXIMUM_IMAGE_UPLOAD_SIZE },
 *   }),
 *   new MaxFileCustomErrorMessageInterceptor(UPLOAD_PARAM_NAME_FOR_FILES, MAX_ALLOWED_UPLOAD_FILES_FOR_POST),
 * )
 * async createFeedPost() { ... }
 */
@Injectable()
export class MaxFileCustomErrorMessageInterceptor implements NestInterceptor {
  constructor(private readonly filesParameterName: string, private readonly maxFiles: number) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const fileCount = request[this.filesParameterName].length;

    if (fileCount > this.maxFiles) {
      return throwError(() => new HttpException(
        `Too many files uploaded. Maximum allowed: ${this.maxFiles}`,
        HttpStatus.BAD_REQUEST,
      ));
    }

    return next.handle();
  }
}

export function generateFileUploadInterceptors(
  fieldName: string,
  maxCount?: number,
  localOptions?: MulterOptions,
) {
  return [
    FilesInterceptor(fieldName, Infinity, localOptions),
    new MaxFileCustomErrorMessageInterceptor(fieldName, maxCount),
  ];
}
