import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * This class is for generating storage locations for files that we want to store.
 * For the most part, it's used to prefix non-prod storage locations with a non-prod
 * prefix so that we can easily restore a production environment to a non-production
 * environment for testing, and make it easy to clean up uploads because they're
 * scoped to a prefixed directory (example: /staging/feeds/feed_12345.png)
 */
@Injectable()
export class StorageLocationService {
  private storageLocationGeneratorPrefix: string;

  constructor(private readonly config: ConfigService) {
    this.storageLocationGeneratorPrefix = this.config.get<string>('STORAGE_LOCATION_GENERATOR_PREFIX') || '';
    if (!this.storageLocationGeneratorPrefix.startsWith('/')) {
      this.storageLocationGeneratorPrefix = `/${this.storageLocationGeneratorPrefix}`;
    }
  }

  getStorageLocationGeneratorPrefix() {
    return this.storageLocationGeneratorPrefix;
  }

  generateNewStorageLocationFor(type: string, filename: string): string {
    return `${this.getStorageLocationGeneratorPrefix()}/${type}/${type}_${filename}`;
  }
}
