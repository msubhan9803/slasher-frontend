import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, CreateBucketCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3StorageService {
  constructor(private readonly config: ConfigService) { }

  /**
   * @param location
   * @param fileName
   * @param file
   */
  async write(location: string, fileName: string, file: Express.Multer.File): Promise<void> {
    try {
      const s3Region = this.config.get<string>('S3_REGION');
      const s3Bucket = this.config.get<string>('S3_BUCKET');
      const awsAccessKeyId = this.config.get<string>('S3_USER_ACCESS_KEY_ID');
      const awsSecretAccessKey = this.config.get<string>('S3_USER_SECRET_ACCESS_KEY');

      const params = {
        Bucket: s3Bucket,
        Key: `${location}${fileName}`,
        Body: file.buffer,
      };

      const s3Client = new S3Client({
        credentials: {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
        },
        region: s3Region,
      });
      await s3Client.send(
        new CreateBucketCommand({ Bucket: params.Bucket }),
      );

      await s3Client.send(new PutObjectCommand(params));
    } catch (error) {
      throw new Error(error);
    }
  }
}
