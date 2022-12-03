import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MoviesService } from '../../movies/providers/movies.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly configService: ConfigService, private readonly moviesService: MoviesService) { }

  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    name: 'syncWithTheMovieDb',
    timeZone: 'America/New_York',
  })
  async syncWithTheMovieDb() {
    if (!this.configService.get<boolean>('CRON_ENABLED')) { return; }
    this.logger.debug('Start: syncWithTheMovieDb cron');

    const startYear = 1895;
    // Ask for 10 years ahead so we also get movies that have not come out yet
    // (even though this may mean that they have limited data).
    const endYear = new Date().getFullYear() + 10;
    await this.moviesService.syncWithTheMovieDb(startYear, endYear);

    this.logger.debug('End: syncWithTheMovieDb cron');
  }
}
