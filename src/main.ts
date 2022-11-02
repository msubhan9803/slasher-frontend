/* eslint-disable no-console */
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as fs from 'fs';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // TODO: Consider a variable logging policy later on, based on NODE_ENV
    // logger: process.env.NODE_ENV === 'development' ? ['log', 'error', 'warn', 'debug', 'verbose'] : ['error', 'warn'],
  });
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 4000);

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
