import {
    Injectable, NestInterceptor, ExecutionContext, CallHandler,
   } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { asyncDeleteMulterFilesNew } from '../../utils/file-upload-validation-utils';

@Injectable()
export class ImagesCleanup implements NestInterceptor {
  // eslint-disable-next-line class-methods-use-this
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
  const request = context.switchToHttp().getRequest();

  return next
    .handle()
    .pipe(
    tap(() => {
      if (request.filesToBeRemoved) {
        asyncDeleteMulterFilesNew(request.filesToBeRemoved);
      }
    }),
    catchError((err) => throwError(() => {
      if (request.filesToBeRemoved) {
        asyncDeleteMulterFilesNew(request.filesToBeRemoved);
      }
      return err;
    })),
    );
  }
}
