import {
  BadRequestException, MiddlewareConsumer, Module, ValidationError, ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { JwtAuthenticationMiddleware } from './app/middleware/jwt-authentication.middleware';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './global/uploads.module';
import { LocalStorageModule } from './local-storage/local-storage.module';
import { ChatModule } from './chat/chat.module';
import { RssFeedProvidersModule } from './rss-feed-providers/rss-feed-providers.module';
import { RssFeedModule } from './rss-feed/rss-feed.module';
import { ArtistsModule } from './artists/artists.module';
import { BooksModule } from './books/books.module';
import { PodcastsModule } from './podcasts/podcasts.module';
import { MusicModule } from './music/music.module';
import { MoviesModule } from './movies/movies.module';
import { EventsModule } from './events/events.module';
import { EventCategoriesModule } from './event-categories/event-categories.module';
import { FeedPostsModule } from './feed-posts/feed-posts.module';
import { FriendsModule } from './friends/friends.module';
import { UserSettingModule } from './settings/user-settings.module';
import { RssFeedProviderFollowsModule } from './rss-feed-provider-follows/rss-feed-provider-follows.module';
import { AppGateway } from './app/providers/app.gateway';
import { TasksService } from './app/providers/tasks.service';
import { BlocksModule } from './blocks/blocks.module';
import { FeedCommentsModule } from './feed-comments/feed-comments.module';
import { SearchModule } from './search/search.module';
import { validateEnv } from './utils/env-validation';
import { FeedLikesModule } from './feed-likes/feed-likes.module';
import { ReportsModule } from './reports/reports.module';
import { QueuedJobsModule } from './global/queued-jobs.module';
import { MulterUploadCleanupInterceptor } from './app/interceptors/multer-upload-cleanup.interceptor';
import { MovieUserStatusModule } from './movie-user-status/movie.user.status.module';
import { AppController } from './app/app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      isGlobal: true,
      validate: validateEnv,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        if (
          config.get<string>('DB_CONNECTION_URL').startsWith('"')
          || config.get<string>('DB_CONNECTION_URL').startsWith("'")) {
          throw new Error(
            "Hey! Your DB connection URL starts with a quote character! If you're using docker "
            + 'and reading in a .env file while running the container, docker will treat the '
            + 'quote character as a literal quote and the connection to the DB will fail!',
          );
        }
        return {
          uri: config.get<string>('DB_CONNECTION_URL'),
          useNewUrlParser: true, // for MongoDB >= 3.1.0
          useUnifiedTopology: true, // for MongoDB >= 3.1.0
        };
      },
    }),
    UploadsModule,
    NotificationsModule,
    UsersModule,
    LocalStorageModule,
    ChatModule,
    RssFeedProvidersModule,
    RssFeedModule,
    ArtistsModule,
    BooksModule,
    PodcastsModule,
    MusicModule,
    MoviesModule,
    EventsModule,
    EventCategoriesModule,
    FeedPostsModule,
    FriendsModule,
    UserSettingModule,
    RssFeedProviderFollowsModule,
    ScheduleModule.forRoot(),
    HttpModule,
    BlocksModule,
    FeedCommentsModule,
    SearchModule,
    FeedLikesModule,
    ReportsModule,
    QueuedJobsModule,
    MovieUserStatusModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: (validationErrors: ValidationError[] = []) => {
          // Convert all nested DTO error messages into top level error messages that are not
          // prefixed by the name of their nested DTO.
          // Note: This only works for 2-level-deep nesting, so if we ever do 3-level-deep nested
          // DTO validation then we will need to update this method.
          const flattenedConstraints = validationErrors.map((error) => {
            let constraints = Object.values(error.constraints || {});
            constraints = constraints.concat(
              ((error.children || []).map((child) => Object.values(child.constraints || {}))).flat(1),
            );
            return constraints;
          }).flat(1);
          return new BadRequestException(flattenedConstraints);
        },
      }),
    },
    // Interceptor to delete temp files created by mutler. It delete files in `request.filesToBeRemoved` after the request is settled.
    {
      provide: APP_INTERCEPTOR,
      useClass: MulterUploadCleanupInterceptor,
    },
    AppGateway,
    TasksService,
  ],
})
export class AppModule {
  // eslint-disable-next-line class-methods-use-this
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthenticationMiddleware)
      .exclude(
        // Reminder: Paths below are exact matches (not "starts with")
        '/',
        '/api',
        '/api/v1',
        '/api/v1/remote-constants',
        '/api/v1/ip-check',
        '/health-check',
        '/placeholders/(.*)', // the placeholders endpoint is only used in development and test environments
        '/api/v1/local-storage/(.*)', // the local-storage endpoint is only used in development and test environments
        '/api/v1/users/activate-account',
        '/api/v1/users/check-user-name',
        '/api/v1/users/validate-registration-fields',
        '/api/v1/users/forgot-password',
        '/api/v1/users/register',
        '/api/v1/users/reset-password',
        '/api/v1/users/sign-in',
        '/api/v1/users/validate-password-reset-token',
        '/api/v1/users/check-email',
        '/api/v1/users/verification-email-not-received',
      )
      .forRoutes('*');
  }
}
