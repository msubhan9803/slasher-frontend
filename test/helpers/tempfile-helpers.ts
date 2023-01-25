import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface TempFileOptions {
  extension?: string;
  size?: number;
}

type TempFileCallback = (filePath: string) => void;
type TempFilesCallback = (filePaths: string[]) => void;

/**
 * Creates multiple temporary files using the given options[] (with an element for each tempfile
 * that you want), and automatically deletes the tempfiles after the given callback completes.
 * @param callback
 * @param optionsArr
 */
export async function createTempFiles(callback: TempFilesCallback, optionsArr?: TempFileOptions[]) {
  const tempFilePaths: string[] = [];
  for (const options of optionsArr) {
    let { extension, size } = options;
    extension ||= '';
    size ||= 0;

    const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.${extension}`);

    const fh = fs.openSync(tempFilePath, 'w');
    fs.writeSync(fh, '.', Math.max(0, size - 1));
    fs.closeSync(fh);

    tempFilePaths.push(tempFilePath);
  }

  try {
    await callback(tempFilePaths);
  } finally {
    for (const tempFilePath of tempFilePaths) {
      fs.unlinkSync(tempFilePath);
    }
  }
}

/**
 * Creates a single, temporary file using the given options and automatically deletes the file after
 * the callback completes.
 * @param callback
 * @param options
 */
export async function createTempFile(callback: TempFileCallback, options?: TempFileOptions) {
  await createTempFiles(async (filePaths) => { await callback(filePaths[0]); }, [options]);
}

/**
 * Creates multiple persistent files using the given options[] (with an element for each tempfile
 * that you want), and automatically deletes the tempfiles after the given callback completes.
 * @param callback
 * @param optionsArr
 */
export async function createPersistentFiles(optionsArr?: TempFileOptions[]) {
  const persistentFilePaths: string[] = [];
  for (const options of optionsArr) {
    let { extension, size } = options;
    extension ||= '';
    size ||= 0;

    const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.${extension}`);

    const fh = fs.openSync(tempFilePath, 'w');
    fs.writeSync(fh, '.', Math.max(0, size - 1));
    fs.closeSync(fh);

    persistentFilePaths.push(tempFilePath);
  }
  return persistentFilePaths;
}

/**
 * Creates a single, persistent file using the given options and automatically deletes the file after
 * the callback completes.
 * @param callback
 * @param options
 */
export async function createPersistentFile(options?: TempFileOptions) {
  const [filePath] = await createPersistentFiles([options]);
  return filePath;
}
