import {
  Global, Logger, Module,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';
import { diskStorage } from 'multer';
import * as path from 'path';
import { StorageLocationService } from './providers/storage-location.service';
import { deleteMulterFiles } from '../utils/file-upload-validation-utils';

const logger = new Logger('UploadsModule');

@Global()
@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        storage: diskStorage({
          destination: async (req, file, cb) => {
            const storagePath = config.get<string>('UPLOAD_DIR');
            return cb(null, storagePath);
          },
          filename: (req, file, cb) => {
            // Clean filename, but keep original file extension.
            // We'll limit upload extensions in the controllers.
            const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
            (req as any).filesToBeRemoved = (req as any).filesToBeRemoved || [];
            const filePath = path.join(config.get<string>('UPLOAD_DIR'), fileName);
            (req as any).filesToBeRemoved.push(filePath);

            // To handle multer cleanup issue on aborted request, we'll manually delete the file
            // when a request is aborted (to prevent accumulation of partial upload files).
            // See this open Multer issue: https://github.com/expressjs/multer/issues/259
            req.on('aborted', () => {
              file.stream.on('end', () => {
                deleteMulterFiles([filePath], logger);
              });
              file.stream.emit('end');
            });
            cb(null, fileName);
          },
        }),
      }),
    }),
  ],
  providers: [StorageLocationService],
  exports: [MulterModule, StorageLocationService],
})
export class UploadsModule { }
