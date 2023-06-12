/* eslint-disable no-console */
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import * as selfsigned from 'selfsigned';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import { AppModule } from './app.module';
import { configureAppPrefixAndVersioning } from './utils/app-setup-utils';
import { initiateFirebase } from './app/providers/initFirebase';

async function bootstrap() {
  let httpsOptions;
  // Note: Can't read HTTPS env variable from ConfigModule because it hasn't been loaded yet.
  if (process.env.HTTPS === 'true') {
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, { days: 365 });
    httpsOptions = {
      key: pems.private,
      cert: pems.cert,
    };
  }

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
    // TODO: Consider a variable logging policy later on, based on NODE_ENV
    // logger: process.env.NODE_ENV === 'development' ? ['log', 'error', 'warn', 'debug', 'verbose'] : ['error', 'warn'],
  });
  configureAppPrefixAndVersioning(app);

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 4000);
  const FIREBASE_SERVER_KEY = config.get<string>('FIREBASE_SERVER_KEY');
  initiateFirebase(FIREBASE_SERVER_KEY);

  // This timeout extension fixes some AWS ALB issues that we're encountering where high CPU
  // acitivity in a container causes 502 errors from the ALB.
  // See: https://github.com/nodejs/node/issues/20256#issuecomment-900197258
  app.getHttpAdapter().getHttpServer().keepAliveTimeout = config.get<number>('REQUEST_TIMEOUT') * 1000;

  const uploadDir = config.get<string>('UPLOAD_DIR');
  if (uploadDir && !fs.existsSync(uploadDir)) {
    console.log(`Creating dir ${uploadDir} because it did not exist.`);
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const localStorageDir = config.get<string>('LOCAL_STORAGE_DIR');
  if (localStorageDir && !fs.existsSync(localStorageDir)) {
    console.log(`Creating localStorageDir ${localStorageDir} because it did not exist.`);
    fs.mkdirSync(localStorageDir, { recursive: true });
  }

  // Enable CORS headers on requests
  app.enableCors();

  const redisIoAdapter = new RedisIoAdapter(app, config);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  console.log(`Starting app on port: ${port}`);
  await app.listen(port);
}
bootstrap();
