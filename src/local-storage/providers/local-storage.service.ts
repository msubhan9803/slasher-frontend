import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LocalStorageService {
  constructor(private readonly config: ConfigService) { }

  /**
   * Returns true on success, false on failure.
   * @param location
   * @param file
   */
  write(location: string, file: Express.Multer.File): boolean {
    // TODO: This should store the given file at LOCAL_STORAGE_DIR + path
    return true;
  }

  /**
   * Returns the full path to the file if found, or undefined if not found.
   * @param location
   */
  getLocalFilePath(location: string): string {
    // TODO: This should return the full path to the file at LOCAL_STORAGE_DIR + path
    return '/path/to/file';
  }
}
