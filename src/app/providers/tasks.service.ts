import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DateTime } from 'luxon';
import { NotificationsService } from '../../notifications/providers/notifications.service';
import { MoviesService } from '../../movies/providers/movies.service';
import { BooksService } from '../../books/providers/books.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly moviesService: MoviesService,
    private readonly notificationsService: NotificationsService,
    private readonly booksService: BooksService,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    name: 'syncWithTheMovieDb',
    timeZone: 'America/New_York',
  })
  async syncWithTheMovieDb(force = false) {
    if (!force && !this.configService.get<boolean>('CRON_ENABLED')) { return; }
    this.logger.debug('Start cron: syncWithTheMovieDb');

    const startYear = 1895;
    // Ask for 10 years ahead so we also get movies that have not come out yet
    // (even though this may mean that they have limited data).
    const endYear = new Date().getFullYear() + 10;
    const { success, error } = await this.moviesService.syncWithTheMovieDb(startYear, endYear);

    if (success) {
      this.logger.debug('End cron: syncWithTheMovieDb (success)');
    } else {
      this.logger.debug(`End cron: syncWithTheMovieDb (failure). Error: ${error}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM, {
    name: 'syncWithTheBookDb',
    timeZone: 'America/New_York',
  })
  async syncWithTheBookDb(force = false) {
    if (!force && !this.configService.get<boolean>('CRON_ENABLED')) { return; }
    this.logger.debug('Start cron: syncWithTheBookDb');

    const { success, error } = await this.booksService.syncWithOpenLibrary();

    if (success) {
      this.logger.debug('End cron: syncWithTheBookDb (success)');
    } else {
      this.logger.debug(`End cron: syncWithTheBookDb (failure). Error: ${error}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM, {
    name: 'cleanupNotifications',
    timeZone: 'America/New_York',
  })
  async cleanupNotifications(force = false) {
    if (!force && !this.configService.get<boolean>('CRON_ENABLED')) { return; }
    this.logger.debug('Start cron: cleanupNotifications');

    const THIRTY_DAYS_AGO = DateTime.now().minus({ days: 30 }).toJSDate();

    // Provide a date argument to specify the last date before which all the notifications would be deleted
    const { success, error } = await this.notificationsService.cleanupNotifications(THIRTY_DAYS_AGO);

    if (success) {
      this.logger.debug('End cron: cleanupNotifications (success)');
    } else {
      this.logger.debug(`End cron: cleanupNotifications (failure). Error: ${error}`);
    }
  }
}
