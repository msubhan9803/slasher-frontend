import { Module } from '@nestjs/common';
import { LocalStorageController } from './local-storage.controller';
import { LocalStorageService } from './providers/local-storage.service';

@Module({
  providers: [LocalStorageService],
  exports: [LocalStorageModule],
  controllers: [LocalStorageController],
})
export class LocalStorageModule { }
