import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 4000);
  // eslint-disable-next-line no-console
  console.log(`Starting app on port: ${port}`);

  app.enableCors();
  await app.listen(port);
}
bootstrap();
