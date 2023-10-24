import { ConfigService } from '@nestjs/config';

export function relativeToFullImagePath(config: ConfigService, relativeImagePath: string | null) {
  if (!relativeImagePath || relativeImagePath.startsWith('http')) { return relativeImagePath; }

  let placeholderToShow: string = null;

  if (relativeImagePath === 'noUser.jpg') {
    placeholderToShow = '/placeholders/default_user_icon.png';
  } else if (relativeImagePath.startsWith('/placeholders/')) {
    placeholderToShow = relativeImagePath;
  }

  if (config.get<string>('FILE_STORAGE') === 's3') {
    return config.get<string>('S3_HOST') + (placeholderToShow || relativeImagePath);
  }
  return config.get<string>('API_URL') + (placeholderToShow || `/api/v1/local-storage${relativeImagePath}`);
}
