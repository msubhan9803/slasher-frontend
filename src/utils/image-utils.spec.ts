import { ConfigService } from '@nestjs/config';
import { relativeToFullImagePath } from './image-utils';

describe('image-utils', () => {
  describe('relativeToFullImagePath', () => {
    const relativeImagePath = '/path/to/image.jpg';
    const specialNoImageValue = 'noImage.jpg';
    const nullValue = null;

    describe('for s3 storage type', () => {
      const s3Host = 'https://anybucket.s3.amazonaws.com';
      const config: ConfigService = new ConfigService({
        FILE_STORAGE: 's3',
        S3_HOST: s3Host,
      });
      it('generates the expected path', () => {
        expect(relativeToFullImagePath(config, relativeImagePath)).toBe(`${s3Host}${relativeImagePath}`);
      });

      it('generates the expected, unchanged path when given relativeImagePath is special no-image value', () => {
        expect(relativeToFullImagePath(config, specialNoImageValue)).toBe(specialNoImageValue);
      });

      it('generates the expected, null when given relativeImagePath is null value', () => {
        expect(relativeToFullImagePath(config, nullValue)).toBe(nullValue);
      });
    });

    describe('for local storage type', () => {
      const config: ConfigService = new ConfigService({
        FILE_STORAGE: 'local',
      });

      it('generates the expected path', () => {
        expect(relativeToFullImagePath(config, relativeImagePath)).toBe(`/local-storage${relativeImagePath}`);
      });

      it('generates the expected, unchanged path when given relativeImagePath is special no-image value', () => {
        expect(relativeToFullImagePath(config, specialNoImageValue)).toBe(specialNoImageValue);
      });

      it('generates the expected, null when given relativeImagePath is null value', () => {
        expect(relativeToFullImagePath(config, nullValue)).toBe(nullValue);
      });
    });
  });
});
