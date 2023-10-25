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
    let isFileDownloadSuccessful = false;
    try {
      await downloadFile(url, savePath); // file is downloaded at `savePath`
      isFileDownloadSuccessful = true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('ERROR: Failed to download remote file from:', url);
    }

    if (isFileDownloadSuccessful) {
      await callback();
    } else {
      // eslint-disable-next-line no-console
      console.log('INFO: SKIPPING image upload to s3 bucket becaue of failure in downloading remote file.');
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to execute downloadFileTemporarily() with following values:', { url, savePath });
  } finally {
    fs.unlinkSync(savePath); // downloaded file is removed deleted after callback is run
  }
}
