import * as mime from 'mime-types';

/**
 * Returns the mime type for the given filename (e.g. 'image.jpg' returns 'image/jpeg').  Also
 * accepts full file paths like '/path/to/image/jpeg'.
 * @param fileName
 * @returns
 */
export function fileNameToMimeType(fileName: string) {
  return mime.lookup(fileName) || 'application/octet-stream';
}
