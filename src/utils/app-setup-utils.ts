import { INestApplication, VersioningType } from '@nestjs/common';

export const configureAppPrefixAndVersioning = (app: INestApplication) => {
  app.setGlobalPrefix('api', {
    exclude: [
      // Reminder: Paths below are exact matches (not "starts with")
      '/',
      '/api',
      '/api/v1',
      '/health-check',
    ],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });
};
