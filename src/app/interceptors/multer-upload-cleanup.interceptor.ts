import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { asyncDeleteMulterFiles } from '../../utils/file-upload-validation-utils';

@Injectable()
export class MulterUploadCleanupInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MulterUploadCleanupInterceptor.name);

  // eslint-disable-next-line class-methods-use-this
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    return next
      .handle()
      .pipe(
        tap(() => {
          if (request.filesToBeRemoved) {
            asyncDeleteMulterFiles(request.filesToBeRemoved, this.logger);
          }
        }),
        catchError((err) => throwError(() => {
          if (request.filesToBeRemoved) {
            asyncDeleteMulterFiles(request.filesToBeRemoved, this.logger);
          }
          return err;
        })),
      );
  }
}
