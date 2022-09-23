import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  constants, copyFileSync, existsSync, mkdirSync,
} from 'fs';
import { resolve } from 'path';

@Injectable()
export class LocalStorageService {
  constructor(private readonly config: ConfigService) { }

  /**
   * Returns true on success, false on failure.
   * @param location
   * @param fileName
   * @param file
   */
  write(location: string, fileName: string, file: Express.Multer.File): void {
    const localStoragePath = this.config.get<string>('LOCAL_STORAGE_DIR');
    const extraStoragePath = `${localStoragePath}${location}`;
    if (!existsSync(extraStoragePath)) {
      mkdirSync(extraStoragePath, { recursive: true });
    }
    copyFileSync(`${file.path}`, `${extraStoragePath}${fileName}`, constants.COPYFILE_EXCL);
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
      throw Error('Invalid path');
    }

    if (existsSync(`${localStoragePath}${location}`)) {
      //file exists
      return `${localStoragePath}${location}`;
    }
    return undefined;
  }
}
