import { ConfigService } from '@nestjs/config';

export function relativeToFullImagePath(config: ConfigService, relativeImagePath: string | null) {
  if (!relativeImagePath) { return relativeImagePath; }

  let placeholderToShow: string = null;

  if (relativeImagePath === 'noUser.jpg') {
    placeholderToShow = '/placeholders/default_user_icon.png';
  }

  if (config.get<string>('FILE_STORAGE') === 's3') {
    return config.get<string>('S3_HOST') + (placeholderToShow || relativeImagePath);
  }
  return config.get<string>('API_URL') + (placeholderToShow || `/local-storage${relativeImagePath}`);
}
