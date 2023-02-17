import { INestApplication, VersioningType } from '@nestjs/common';

export const configureAppPrefixAndVersioning = (app: INestApplication) => {
  app.setGlobalPrefix('api', {
    exclude: [
      '/local-storage/(.*)',
    ],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });
};
