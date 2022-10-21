import { ConfigService } from '@nestjs/config';
import { relativeToFullImagePath } from './image-utils';

describe('image-utils', () => {
  describe('relativeToFullImagePath', () => {
    const relativeImagePath = '/path/to/image.jpg';
    const specialNoUserValue = 'noUser.jpg';

    describe('for s3 storage type', () => {
      const s3Host = 'https://anybucket.s3.amazonaws.com';
      const config: ConfigService = new ConfigService({
        FILE_STORAGE: 's3',
        S3_HOST: s3Host,
      });
      it('generates the expected path', () => {
        expect(relativeToFullImagePath(config, relativeImagePath)).toBe(`${s3Host}${relativeImagePath}`);
      });

      it('generates the expected placeholder image url for the special noUser value', () => {
        expect(relativeToFullImagePath(config, specialNoUserValue)).toBe(`${s3Host}/placeholders/default_user_icon.png`);
      });

      it('for a falsy value like null, returns the passed-in falsy value', () => {
        expect(relativeToFullImagePath(config, null)).toBeNull();
      });
    });

    describe('for local storage type', () => {
      const apiUrl = 'http://example.com';
      const config: ConfigService = new ConfigService({
        FILE_STORAGE: 'local',
        API_URL: apiUrl,
      });

      it('generates the expected path', () => {
        expect(relativeToFullImagePath(config, relativeImagePath)).toBe(`${apiUrl}/local-storage${relativeImagePath}`);
      });

      it('generates the expected placeholder image url for the special noUser value', () => {
        expect(relativeToFullImagePath(config, specialNoUserValue)).toBe(`${apiUrl}/placeholders/default_user_icon.png`);
      });

      it('for a falsy value like null, returns the passed-in falsy value', () => {
        expect(relativeToFullImagePath(config, null)).toBeNull();
      });
    });
  });
});
