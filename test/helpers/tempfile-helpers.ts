import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface TempFileOptions {
  extension?: string;
  size?: number;
}

type TempFileCallback = (filePath: string) => void;

/**
 * Creates a temporary file using the given options and automatically deletes it after
 * the callback completes.
 * @param callback
 * @param options
 */
export async function createTempFile(callback: TempFileCallback, options?: TempFileOptions) {
  let { extension, size } = options;
  extension ||= '';
  size ||= 0;

  const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.${extension}`);

  const fh = fs.openSync(tempFilePath, 'w');
  fs.writeSync(fh, '.', Math.max(0, size - 1));
  fs.closeSync(fh);

  try {
    await callback(tempFilePath);
  } finally {
    fs.unlinkSync(tempFilePath);
  }
}
