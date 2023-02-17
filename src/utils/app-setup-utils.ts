import { INestApplication, VersioningType } from '@nestjs/common';

export const configureAppPrefixAndVersioning = (app: INestApplication) => {
  app.setGlobalPrefix('api', {
    exclude: [
      '/', // exact match
      '/api', // exact match
      '/api/v1', // exact match
      '/health-check', // exact match
    ],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });
};
