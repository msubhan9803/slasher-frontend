import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client, HeadObjectCommand, HeadObjectCommandInput, PutObjectCommand, PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { createReadStream, existsSync } from 'fs';
import { fileNameToMimeType } from '../../utils/mime-utils';
import { S3FileExistsError } from '../../errors';

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);

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
  async write(location: string, file: Express.Multer.File): Promise<void> {
    if (!existsSync(file.path)) { throw Error(`Uploaded file not found at upload path: ${file.path}`); }
    const exists = await this.s3ObjectExists(location);
    if (exists) {
      throw new S3FileExistsError(
        `Tried to perform S3 upload, but found unexpected existing object at bucket location: ${location}`,
      );
    }

    const readStream = createReadStream(file.path);
    await this.s3PutObject({
      Bucket: this.s3Bucket,
      Key: this.locationToS3Key(location),
      Body: readStream,
      ContentType: fileNameToMimeType(location),
    });
    await new Promise((resolve) => {
      readStream.close(() => resolve(undefined));
    });
  }

  async s3PutObject(input: PutObjectCommandInput) {
    return this.s3Client.send(new PutObjectCommand(input));
  }

  async s3HeadRequestForObject(input: HeadObjectCommandInput) {
    return this.s3Client.send(new HeadObjectCommand(input));
  }

  async s3ObjectExists(location: string): Promise<boolean> {
    try {
      await this.s3HeadRequestForObject({
        Bucket: this.s3Bucket,
        Key: this.locationToS3Key(location),
      });
    } catch (error) {
      if (error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      if (error.$metadata?.httpStatusCode === 403) {
        this.logger.debug(`Received 403 response from S3 (using S3_USER_ACCESS_KEY_ID ${this.config.get<string>('S3_USER_ACCESS_KEY_ID')}`);
      }
      throw error; // re-throw unexpected error
    }
    return true;
  }

  // eslint-disable-next-line class-methods-use-this
  locationToS3Key(location: string) {
    return location.replace(/^\//, '');
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
