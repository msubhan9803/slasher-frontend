/* eslint-disable no-console */
import * as fs from 'fs';
import { createWriteStream } from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { https } from 'follow-redirects';

export async function downloadFile(url: string, savePath: string) {
  const file = createWriteStream(savePath);

  await new Promise<void>((resolve, reject) => {
    https.get(url, (res) => {
      res.pipe(file);
      // after download completed close filestream
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (e) => reject(e));
  });
}

export async function downloadFileTemporarily(url: string, savePath: string, callback: () => void) {
  try {
    await downloadFile(url, savePath); // file is downloaded at `savePath`
    await callback();
  } catch (error) {
    console.error('Failed to execute downloadFileTemporarily() with following values:', { url, savePath });
  } finally {
    fs.unlinkSync(savePath); // downloaded file is removed deleted after callback is run
  }
}
