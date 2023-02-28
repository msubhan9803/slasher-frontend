import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  constants, copyFileSync, existsSync, mkdirSync,
} from 'fs';
import { join, dirname, resolve } from 'path';
import { InvalidPathError } from '../../errors';

@Injectable()
export class LocalStorageService {
  constructor(private readonly config: ConfigService) { }

  /**
   * Returns true on success, false on failure.
   * @param location
   * @param fileName
   * @param file
   */
  write(location: string, file: Express.Multer.File): void {
    const localStoragePath = this.config.get<string>('LOCAL_STORAGE_DIR');
    const destPath = join(localStoragePath, location);
    const destPathParentDir = dirname(destPath);
    if (!existsSync(destPathParentDir)) {
      mkdirSync(destPathParentDir, { recursive: true });
    }
    copyFileSync(`${file.path}`, destPath, constants.COPYFILE_EXCL);
  }

  /**
   * Returns the full path to the file if found, or undefined if not found.
   * @param location
   */
  getLocalFilePath(location: string): string {
    const localStoragePath = this.config.get<string>('LOCAL_STORAGE_DIR');

    // Ensure that requested location is not outside of localStoragePath (via use of '..')
    if (
      !location.startsWith('/')
      || location.includes('/../')
      || !resolve(`${localStoragePath}${location}`).toString().startsWith(resolve(localStoragePath).toString())
    ) {
      throw new InvalidPathError('Invalid path');
    }

    if (existsSync(`${localStoragePath}${location}`)) {
      //file exists
      return `${localStoragePath}${location}`;
    }
    return undefined;
  }
}
