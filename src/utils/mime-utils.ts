import * as mime from 'mime-types';

export function fileNameToMimeType(fileName: string) {
  return mime.lookup(fileName) || 'application/octet-stream';
}
