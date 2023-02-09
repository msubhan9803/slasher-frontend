import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { deleteMulterFiles } from '../../utils/file-upload-utils';

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
            deleteMulterFiles(request.filesToBeRemoved, this.logger);
          }
        }),
        catchError((err) => throwError(() => {
          if (request.filesToBeRemoved) {
            deleteMulterFiles(request.filesToBeRemoved, this.logger);
          }
          return err;
        })),
      );
  }
}
