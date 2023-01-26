import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { unlink } from 'fs';

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
            this.asyncDeleteMulterFiles(request.filesToBeRemoved);
          }
        }),
        catchError((err) => throwError(() => {
          if (request.filesToBeRemoved) {
            this.asyncDeleteMulterFiles(request.filesToBeRemoved);
          }
          return err;
        })),
      );
  }

  asyncDeleteMulterFiles(files: string[]) {
    files.forEach((path) => {
      unlink(path, (err) => {
        if (err) {
          this.logger.error(`Encountered an error while deleting Multer temporary upload file at: ${path} -- ${err.message}`);
        }
      });
    });
  }
}
