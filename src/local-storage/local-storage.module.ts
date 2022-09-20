import { Module } from '@nestjs/common';

@Module({
  providers: [LocalStorageModule],
  exports: [LocalStorageModule],
})
export class LocalStorageModule { }
