import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { APP_PIPE } from '@nestjs/core';
import { JwtAuthenticationMiddleware } from './app/middleware/jwt-authentication.middleware';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('DB_CONNECTION_URL'),
        useNewUrlParser: true, // for MongoDB >= 3.1.0
        useUnifiedTopology: true, // for MongoDB >= 3.1.0
      }),
      inject: [ConfigService],
    }),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, transform: true }),
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthenticationMiddleware)
      .exclude(
        '/',
        '/users/sign-in',
        '/users/register',
        '/users/suggested-friends',
      )
      .forRoutes('*');
  }
}
