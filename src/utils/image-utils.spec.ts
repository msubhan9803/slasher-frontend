import { ConfigService } from '@nestjs/config';
import { relativeToFullImagePath } from './image-utils';

describe('image-utils', () => {
  describe('relativeToFullImagePath', () => {
    const imagePath = '/path/to/image.jpg';

    it('generates the expected path for s3 storage type', () => {
      const s3Host = 'https://anybucket.s3.amazonaws.com';
      const config: ConfigService = new ConfigService({
        FILE_STORAGE: 's3',
        S3_HOST: 'https://anybucket.s3.amazonaws.com',
      });
      expect(relativeToFullImagePath(config, imagePath)).toBe(`${s3Host}${imagePath}`);
    });

    it('generates the expected path for local storage type', () => {
      const config: ConfigService = new ConfigService({
        FILE_STORAGE: 'local',
      });
      expect(relativeToFullImagePath(config, imagePath)).toBe(`/local-storage${imagePath}`);
    });
  });
});
