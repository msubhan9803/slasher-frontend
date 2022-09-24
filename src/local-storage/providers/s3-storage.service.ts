import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { createReadStream, existsSync } from 'fs';
import { fileNameToMimeType } from '../../utils/mime-utils';

@Injectable()
export class S3StorageService {
  private s3Client: S3Client;

  private s3Bucket: string;

  constructor(private readonly config: ConfigService) {
    this.s3Client = this.createS3Client();
    this.s3Bucket = this.config.get<string>('S3_BUCKET');
  }

  /**
   * @param location
   * @param fileName
   * @param file
   */
  async write(location: string, fileName: string, file: Express.Multer.File): Promise<void> {
    if (!existsSync(file.path)) { throw Error(`Uploaded file not found at upload path: ${file.path}`); }
    const readStream = createReadStream(file.path);
    await this.s3PutObject({
      Bucket: this.s3Bucket,
      Key: `${location.replace(/^\//, '')}${fileName}`,
      Body: readStream,
      ContentType: fileNameToMimeType(fileName),
    });
    await new Promise((resolve) => {
      readStream.close(() => resolve(undefined));
    });
  }

  s3PutObject(input: PutObjectCommandInput) {
    return this.s3Client.send(new PutObjectCommand(input));
  }

  private createS3Client() {
    return new S3Client({
      credentials: {
        accessKeyId: this.config.get<string>('S3_USER_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get<string>('S3_USER_SECRET_ACCESS_KEY'),
      },
      region: this.config.get<string>('S3_REGION'),
    });
  }
}
