import { INestApplication, VersioningType } from '@nestjs/common';

export const configureAppPrefixAndVersioning = (app: INestApplication) => {
  app.setGlobalPrefix('api', {
    exclude: [
      // Reminder: Paths below are exact matches (not "starts with")
      '/',
      '/api',
      '/api/(.*)', // don't prefix something with /api if it already starts with api
      '/health-check',
    ],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });
};
