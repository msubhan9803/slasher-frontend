import { ConfigService } from '@nestjs/config';

export function relativeToFullImagePath(config: ConfigService, relativeImagePath: string | null) {
  // Need to handle special case 'noImage.jpg' for compatibility with old API/app
  if (relativeImagePath === 'noImage.jpg' || !relativeImagePath) { return relativeImagePath; }

  // Otherwise convert local url to full url based on app type
  return config.get<string>('FILE_STORAGE') === 's3'
    ? config.get<string>('S3_HOST') + relativeImagePath
    : `/local-storage${relativeImagePath}`;
}
